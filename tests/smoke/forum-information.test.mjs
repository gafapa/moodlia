import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';
import { loadContract, toRestFunctionName } from '../helpers/contract.mjs';
import { getEnv, getTimeout, requireEnv, resolveCliCommand } from '../helpers/env.mjs';
import { callMcp } from '../helpers/mcp.mjs';
import { callRestFunction } from '../helpers/moodle-rest.mjs';
import { fromRoot } from '../helpers/paths.mjs';

const execFileAsync = promisify(execFile);
const hasConfig = requireEnv(['MOODLE_BASE_URL', 'MOODLE_REST_TOKEN']);

async function callMcpTool(name, toolArguments = {}) {
  return callMcp('tools/call', {
    name,
    arguments: toolArguments
  });
}

async function callCli(args) {
  const configured = resolveCliCommand();
  const localCli = fromRoot('cli/moodle-mcp.mjs');
  const commandPath = configured ?? localCli;
  const command = commandPath.endsWith('.mjs') || commandPath.endsWith('.js') ? process.execPath : commandPath;
  const commandArgs = command === process.execPath ? [commandPath, ...args, '--format', 'json'] : [...args, '--format', 'json'];
  const { stdout } = await execFileAsync(command, commandArgs, {
    timeout: getTimeout(),
    env: {
      ...process.env,
      MOODLE_BASE_URL: getEnv('MOODLE_BASE_URL'),
      MOODLE_REST_TOKEN: getEnv('MOODLE_REST_TOKEN')
    }
  });

  return JSON.parse(stdout.trim());
}

function assertCourseForums(payload, courseId, forumModule) {
  assert.equal(payload.course_id, courseId);
  assert.equal(payload.count, payload.forums.length);
  assert.equal(Array.isArray(payload.warnings), true);
  const found = payload.forums.find((forum) => forum.forum_id === forumModule.instance_id);
  assert.ok(found, `Forum ${forumModule.instance_id} should be listed`);
  assert.equal(found.module_id, forumModule.course_module_id);
  assert.equal(found.course_id, courseId);
  assert.equal(found.forum_type, 'general');
  assert.equal(typeof found.name, 'string');
  assert.equal(typeof found.intro, 'string');
  assert.equal(typeof found.discussion_count, 'number');
  assert.equal(typeof found.can_create_discussions, 'boolean');
  assert.equal(typeof found.url, 'string');
}

test('Forum information operations work through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const callRest = (operation, parameters = {}) =>
    callRestFunction(toRestFunctionName(contract, operation), parameters);

  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let category = null;
  let course = null;
  let forum = null;
  let success = false;

  try {
    category = await callRest('create_course_category', {
      name: `MoodlIA Forum Info Category ${suffix}`,
      visible: 1
    });

    course = await callRest('create_course', {
      fullname: `MoodlIA Forum Info Course ${suffix}`,
      shortname: `moodlia-forum-info-${suffix}`,
      category_id: category.category_id,
      visible: 0
    });

    const section = await callRest('create_section', {
      course_id: course.course_id,
      name: `MoodlIA Forum Info Section ${suffix}`
    });

    forum = await callRest('create_module', {
      course_id: course.course_id,
      section_number: section.section_number,
      module_type: 'forum',
      name: `MoodlIA Forum Info ${suffix}`,
      options: JSON.stringify({
        forum_type: 'general',
        intro: `<p>MoodlIA forum information smoke ${suffix}</p>`,
        display_word_count: true
      })
    });

    await callRest('create_forum_discussion', {
      course_id: course.course_id,
      module_id: forum.course_module_id,
      name: `MoodlIA Forum Info Discussion ${suffix}`,
      message: '<p>Discussion used to verify forum listing totals.</p>'
    });

    const restForums = await callRest('get_course_forums', {
      course_id: course.course_id
    });
    assertCourseForums(restForums, course.course_id, forum);

    const restView = await callRest('view_forum', {
      course_id: course.course_id,
      module_id: forum.course_module_id
    });
    assert.equal(restView.forum_id, forum.instance_id);
    assert.equal(restView.module_id, forum.course_module_id);
    assert.equal(restView.viewed, true);

    const mcpForums = await callMcpTool('get_course_forums', {
      course_id: course.course_id
    });
    assertCourseForums(mcpForums, course.course_id, forum);

    const mcpView = await callMcpTool('view_forum', {
      course_id: course.course_id,
      module_id: forum.course_module_id
    });
    assert.equal(mcpView.viewed, true);

    const cliForums = await callCli([
      'get-course-forums',
      '--course-id', String(course.course_id)
    ]);
    assertCourseForums(cliForums, course.course_id, forum);

    const cliView = await callCli([
      'view-forum',
      '--course-id', String(course.course_id),
      '--module-id', String(forum.course_module_id)
    ]);
    assert.equal(cliView.viewed, true);

    success = true;
  } finally {
    if (success && course?.course_id) {
      await callRest('delete_course', {
        course_id: course.course_id
      });
    } else if (course?.course_id) {
      console.error(`Forum information course left in Moodle for inspection: ${course.course_id}`);
    }

    if (success && category?.category_id) {
      await callRest('delete_course_category', {
        category_id: category.category_id
      });
    } else if (category?.category_id) {
      console.error(`Forum information category left in Moodle for inspection: ${category.category_id}`);
    }
  }
});
