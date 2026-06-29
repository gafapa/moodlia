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
  const commandArgs = command === process.execPath ? [commandPath, ...args] : args;
  const { stdout } = await execFileAsync(command, [...commandArgs, '--format', 'json'], {
    timeout: getTimeout(),
    env: {
      ...process.env,
      MOODLE_BASE_URL: getEnv('MOODLE_BASE_URL'),
      MOODLE_REST_TOKEN: getEnv('MOODLE_REST_TOKEN')
    }
  });

  return JSON.parse(stdout.trim());
}

test('Forum discussion state operations work through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let categoryId = null;
  let courseId = null;

  try {
    const category = await callRestFunction(toRestFunctionName(contract, 'create_course_category'), {
      name: `MoodlIA Forum State Category ${suffix}`,
      visible: 1
    });
    categoryId = category.category_id;

    const course = await callRestFunction(toRestFunctionName(contract, 'create_course'), {
      fullname: `MoodlIA Forum State Course ${suffix}`,
      shortname: `moodlia-forum-state-${suffix}`,
      category_id: categoryId,
      visible: 0,
      summary: `<p>MoodlIA forum state smoke course ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });
    courseId = course.course_id;

    const section = await callRestFunction(toRestFunctionName(contract, 'create_section'), {
      course_id: courseId,
      name: `MoodlIA Forum State Section ${suffix}`
    });

    const forum = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'forum',
      name: `MoodlIA Forum State ${suffix}`,
      options: JSON.stringify({
        forum_type: 'general',
        intro: '<p>Forum state smoke.</p>'
      })
    });

    const discussion = await callRestFunction(toRestFunctionName(contract, 'create_forum_discussion'), {
      course_id: courseId,
      module_id: forum.course_module_id,
      name: `MoodlIA Forum State Discussion ${suffix}`,
      message: '<p>Discussion used to verify pin and lock state.</p>'
    });

    const restPinned = await callRestFunction(toRestFunctionName(contract, 'set_forum_discussion_pin'), {
      course_id: courseId,
      module_id: forum.course_module_id,
      discussion_id: discussion.discussion_id,
      pinned: 1
    });
    assert.equal(restPinned.discussion_id, discussion.discussion_id);
    assert.equal(restPinned.pinned, true);

    const mcpUnpinned = await callMcpTool('set_forum_discussion_pin', {
      course_id: courseId,
      module_id: forum.course_module_id,
      discussion_id: discussion.discussion_id,
      pinned: false
    });
    assert.equal(mcpUnpinned.discussion_id, discussion.discussion_id);
    assert.equal(mcpUnpinned.pinned, false);

    const cliPinned = await callCli([
      'set-forum-discussion-pin',
      '--course-id', String(courseId),
      '--module-id', String(forum.course_module_id),
      '--discussion-id', String(discussion.discussion_id),
      '--pinned', 'true'
    ]);
    assert.equal(cliPinned.discussion_id, discussion.discussion_id);
    assert.equal(cliPinned.pinned, true);

    const restFavourite = await callRestFunction(toRestFunctionName(contract, 'set_forum_discussion_favourite'), {
      course_id: courseId,
      module_id: forum.course_module_id,
      discussion_id: discussion.discussion_id,
      favourite: 1
    });
    assert.equal(restFavourite.discussion_id, discussion.discussion_id);
    assert.equal(restFavourite.favourite, true);

    const mcpUnfavourite = await callMcpTool('set_forum_discussion_favourite', {
      course_id: courseId,
      module_id: forum.course_module_id,
      discussion_id: discussion.discussion_id,
      favourite: false
    });
    assert.equal(mcpUnfavourite.discussion_id, discussion.discussion_id);
    assert.equal(mcpUnfavourite.favourite, false);

    const cliFavourite = await callCli([
      'set-forum-discussion-favourite',
      '--course-id', String(courseId),
      '--module-id', String(forum.course_module_id),
      '--discussion-id', String(discussion.discussion_id),
      '--favourite', 'true'
    ]);
    assert.equal(cliFavourite.discussion_id, discussion.discussion_id);
    assert.equal(cliFavourite.favourite, true);

    const restSubscribed = await callRestFunction(toRestFunctionName(contract, 'set_forum_discussion_subscription'), {
      course_id: courseId,
      module_id: forum.course_module_id,
      discussion_id: discussion.discussion_id,
      subscribed: 1
    });
    assert.equal(restSubscribed.discussion_id, discussion.discussion_id);
    assert.equal(restSubscribed.subscribed, true);

    const mcpUnsubscribed = await callMcpTool('set_forum_discussion_subscription', {
      course_id: courseId,
      module_id: forum.course_module_id,
      discussion_id: discussion.discussion_id,
      subscribed: false
    });
    assert.equal(mcpUnsubscribed.discussion_id, discussion.discussion_id);
    assert.equal(mcpUnsubscribed.subscribed, false);

    const cliSubscribed = await callCli([
      'set-forum-discussion-subscription',
      '--course-id', String(courseId),
      '--module-id', String(forum.course_module_id),
      '--discussion-id', String(discussion.discussion_id),
      '--subscribed', 'true'
    ]);
    assert.equal(cliSubscribed.discussion_id, discussion.discussion_id);
    assert.equal(cliSubscribed.subscribed, true);

    const restLocked = await callRestFunction(toRestFunctionName(contract, 'set_forum_discussion_lock'), {
      course_id: courseId,
      module_id: forum.course_module_id,
      discussion_id: discussion.discussion_id,
      locked: 1
    });
    assert.equal(restLocked.discussion_id, discussion.discussion_id);
    assert.equal(restLocked.locked, true);
    assert.equal(restLocked.lock_time > 0, true);

    const mcpUnlocked = await callMcpTool('set_forum_discussion_lock', {
      course_id: courseId,
      module_id: forum.course_module_id,
      discussion_id: discussion.discussion_id,
      locked: false
    });
    assert.equal(mcpUnlocked.discussion_id, discussion.discussion_id);
    assert.equal(mcpUnlocked.locked, false);
    assert.equal(mcpUnlocked.lock_time, 0);

    const cliLocked = await callCli([
      'set-forum-discussion-lock',
      '--course-id', String(courseId),
      '--module-id', String(forum.course_module_id),
      '--discussion-id', String(discussion.discussion_id),
      '--locked', 'true'
    ]);
    assert.equal(cliLocked.discussion_id, discussion.discussion_id);
    assert.equal(cliLocked.locked, true);
    assert.equal(cliLocked.lock_time > 0, true);

    const cliUnlocked = await callCli([
      'set-forum-discussion-lock',
      '--course-id', String(courseId),
      '--module-id', String(forum.course_module_id),
      '--discussion-id', String(discussion.discussion_id),
      '--locked', 'false'
    ]);
    assert.equal(cliUnlocked.discussion_id, discussion.discussion_id);
    assert.equal(cliUnlocked.locked, false);
    assert.equal(cliUnlocked.lock_time, 0);

    const deletedCourse = await callRestFunction(toRestFunctionName(contract, 'delete_course'), {
      course_id: courseId
    });
    assert.equal(deletedCourse.deleted, true);
    courseId = null;

    const deletedCategory = await callRestFunction(toRestFunctionName(contract, 'delete_course_category'), {
      category_id: categoryId
    });
    assert.equal(deletedCategory.deleted, true);
    categoryId = null;
  } finally {
    if (courseId !== null) {
      // The course is intentionally left behind on failure for manual Moodle inspection.
    } else if (categoryId !== null) {
      await callRestFunction(toRestFunctionName(contract, 'delete_course_category'), {
        category_id: categoryId
      });
    }
  }
});
