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

function assertCourseFeedbacks(payload, courseId, feedbackModule) {
  assert.equal(payload.course_id, courseId);
  assert.equal(payload.count, payload.feedbacks.length);
  assert.equal(Array.isArray(payload.warnings), true);
  const found = payload.feedbacks.find((feedback) => feedback.feedback_id === feedbackModule.instance_id);
  assert.ok(found, `Feedback ${feedbackModule.instance_id} should be listed`);
  assert.equal(found.module_id, feedbackModule.course_module_id);
  assert.equal(found.course_id, courseId);
  assert.equal(typeof found.name, 'string');
  assert.equal(typeof found.intro, 'string');
  assert.equal(typeof found.multiple_submit, 'boolean');
  assert.equal(typeof found.publish_stats, 'boolean');
  assert.equal(typeof found.url, 'string');
}

function assertAccessInformation(payload, feedbackModule) {
  assert.equal(payload.feedback_id, feedbackModule.instance_id);
  assert.equal(payload.module_id, feedbackModule.course_module_id);
  assert.equal(Array.isArray(payload.warnings), true);
  for (const key of [
    'can_view_analysis',
    'can_complete',
    'can_submit',
    'can_delete_submissions',
    'can_view_reports',
    'can_edit_items',
    'is_empty',
    'is_open',
    'is_already_submitted',
    'is_anonymous'
  ]) {
    assert.equal(typeof payload[key], 'boolean', `${key} must be boolean`);
  }
}

test('Feedback information operations work through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const callRest = (operation, parameters = {}) =>
    callRestFunction(toRestFunctionName(contract, operation), parameters);

  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const timeOpen = Math.floor(Date.now() / 1000) - 60;
  let category = null;
  let course = null;
  let feedback = null;
  let success = false;

  try {
    category = await callRest('create_course_category', {
      name: `MoodlIA Feedback Info Category ${suffix}`,
      visible: 1
    });

    course = await callRest('create_course', {
      fullname: `MoodlIA Feedback Info Course ${suffix}`,
      shortname: `moodlia-feedback-info-${suffix}`,
      category_id: category.category_id,
      visible: 0
    });

    const section = await callRest('create_section', {
      course_id: course.course_id,
      name: `MoodlIA Feedback Info Section ${suffix}`
    });

    feedback = await callRest('create_module', {
      course_id: course.course_id,
      section_number: section.section_number,
      module_type: 'feedback',
      name: `MoodlIA Feedback Info ${suffix}`,
      options: JSON.stringify({
        intro: `<p>MoodlIA feedback information smoke ${suffix}</p>`,
        anonymous: 'anonymous',
        multiple_submit: true,
        publish_stats: true,
        time_open: timeOpen,
        time_close: timeOpen + 86400
      })
    });

    const restFeedbacks = await callRest('get_course_feedbacks', {
      course_id: course.course_id
    });
    assertCourseFeedbacks(restFeedbacks, course.course_id, feedback);

    const restAccess = await callRest('get_feedback_access_information', {
      course_id: course.course_id,
      module_id: feedback.course_module_id
    });
    assertAccessInformation(restAccess, feedback);

    const restView = await callRest('view_feedback', {
      course_id: course.course_id,
      module_id: feedback.course_module_id
    });
    assert.equal(restView.feedback_id, feedback.instance_id);
    assert.equal(restView.module_id, feedback.course_module_id);
    assert.equal(restView.viewed, true);

    const mcpFeedbacks = await callMcpTool('get_course_feedbacks', {
      course_id: course.course_id
    });
    assertCourseFeedbacks(mcpFeedbacks, course.course_id, feedback);

    const mcpAccess = await callMcpTool('get_feedback_access_information', {
      course_id: course.course_id,
      module_id: feedback.course_module_id
    });
    assertAccessInformation(mcpAccess, feedback);

    const mcpView = await callMcpTool('view_feedback', {
      course_id: course.course_id,
      module_id: feedback.course_module_id
    });
    assert.equal(mcpView.viewed, true);

    const cliFeedbacks = await callCli([
      'get-course-feedbacks',
      '--course-id', String(course.course_id)
    ]);
    assertCourseFeedbacks(cliFeedbacks, course.course_id, feedback);

    const cliAccess = await callCli([
      'get-feedback-access-information',
      '--course-id', String(course.course_id),
      '--module-id', String(feedback.course_module_id)
    ]);
    assertAccessInformation(cliAccess, feedback);

    const cliView = await callCli([
      'view-feedback',
      '--course-id', String(course.course_id),
      '--module-id', String(feedback.course_module_id)
    ]);
    assert.equal(cliView.viewed, true);

    success = true;
  } finally {
    if (success && course?.course_id) {
      await callRest('delete_course', {
        course_id: course.course_id
      });
    } else if (course?.course_id) {
      console.error(`Feedback information course left in Moodle for inspection: ${course.course_id}`);
    }

    if (success && category?.category_id) {
      await callRest('delete_course_category', {
        category_id: category.category_id
      });
    } else if (category?.category_id) {
      console.error(`Feedback information category left in Moodle for inspection: ${category.category_id}`);
    }
  }
});
