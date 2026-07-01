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

function assertEmptyFeedbackItems(payload, courseId, feedbackModule) {
  assert.equal(payload.course_id, courseId);
  assert.equal(payload.module_id, feedbackModule.course_module_id);
  assert.equal(payload.feedback_id, feedbackModule.instance_id);
  assert.equal(payload.count, 0);
  assert.deepEqual(payload.items, []);
}

test('Feedback item listing works through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const categoryName = `MoodlIA Feedback Items Category ${suffix}`;
  const courseName = `MoodlIA Feedback Items Course ${suffix}`;
  const courseShortname = `moodlia-feedback-items-${suffix}`;
  const sectionName = `MoodlIA Feedback Items Section ${suffix}`;
  let categoryId = null;
  let courseId = null;
  let feedbackDeleted = false;
  let sectionDeleted = false;
  let categoryDeleted = false;

  try {
    const category = await callRestFunction(toRestFunctionName(contract, 'create_course_category'), {
      name: categoryName,
      visible: 1
    });
    categoryId = category.category_id;

    const course = await callRestFunction(toRestFunctionName(contract, 'create_course'), {
      fullname: courseName,
      shortname: courseShortname,
      category_id: categoryId,
      visible: 0,
      summary: `<p>MoodlIA feedback item smoke course ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });
    courseId = course.course_id;

    const section = await callRestFunction(toRestFunctionName(contract, 'create_section'), {
      course_id: courseId,
      name: sectionName
    });

    const feedback = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'feedback',
      name: `MoodlIA Feedback Items ${suffix}`,
      options: JSON.stringify({
        intro: `<p>MoodlIA feedback item intro ${suffix}</p>`,
        anonymous: 'anonymous',
        multiple_submit: true
      })
    });
    assert.equal(feedback.module_type, 'feedback');

    const restItems = await callRestFunction(toRestFunctionName(contract, 'get_feedback_items'), {
      course_id: courseId,
      module_id: feedback.course_module_id
    });
    assertEmptyFeedbackItems(restItems, courseId, feedback);

    const mcpItems = await callMcpTool('get_feedback_items', {
      course_id: courseId,
      module_id: feedback.course_module_id
    });
    assertEmptyFeedbackItems(mcpItems, courseId, feedback);

    const cliItems = await callCli([
      'get-feedback-items',
      '--course-id', String(courseId),
      '--module-id', String(feedback.course_module_id)
    ]);
    assertEmptyFeedbackItems(cliItems, courseId, feedback);

    await assert.rejects(
      () => callRestFunction(toRestFunctionName(contract, 'delete_feedback_item'), {
        course_id: courseId,
        module_id: feedback.course_module_id,
        item_id: 999999999
      }),
      /Moodle REST error|feedback\/invaliditemid/
    );

    const deletedFeedback = await callRestFunction(toRestFunctionName(contract, 'delete_module'), {
      course_id: courseId,
      module_id: feedback.course_module_id
    });
    assert.equal(deletedFeedback.deleted, true);
    feedbackDeleted = true;

    const deletedSection = await callRestFunction(toRestFunctionName(contract, 'delete_section'), {
      course_id: courseId,
      section_id: section.section_id
    });
    assert.equal(deletedSection.deleted, true);
    sectionDeleted = true;

    const deletedCourse = await callRestFunction(toRestFunctionName(contract, 'delete_course'), {
      course_id: courseId
    });
    assert.equal(deletedCourse.deleted, true);
    courseId = null;

    const deletedCategory = await callRestFunction(toRestFunctionName(contract, 'delete_course_category'), {
      category_id: categoryId
    });
    assert.equal(deletedCategory.deleted, true);
    categoryDeleted = true;
    categoryId = null;
  } catch (error) {
    if (courseId) {
      console.error(`Generated feedback items course left in Moodle for inspection: ${courseId}`);
      if (!feedbackDeleted) {
        console.error('Feedback module cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!sectionDeleted) {
        console.error('Feedback items section cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
    }
    if (categoryId && !categoryDeleted) {
      console.error(`Generated feedback items course category left in Moodle for inspection: ${categoryId}`);
    }
    throw error;
  }
});
