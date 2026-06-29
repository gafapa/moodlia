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

function feedbackOptions(suffix, overrides = {}) {
  const timeOpen = Math.floor(Date.now() / 1000) - 60;
  return {
    intro: `<p>MoodlIA feedback intro ${suffix}</p>`,
    anonymous: 'non_anonymous',
    multiple_submit: true,
    email_notification: false,
    autonumbering: true,
    publish_stats: true,
    page_after_submit: `<p>MoodlIA feedback completion page ${suffix}</p>`,
    site_after_submit: `https://example.com/moodlia-feedback-${suffix}`,
    completion_submit: true,
    time_open: timeOpen,
    time_close: timeOpen + 86400,
    ...overrides
  };
}

function assertFeedbackDetails(details, created, expectedAnonymous) {
  const extra = JSON.parse(details.extra_json);

  assert.equal(details.module_type, 'feedback');
  assert.equal(details.course_module_id, created.course_module_id);
  assert.equal(extra.activity.feedback_id, created.instance_id);
  assert.equal(extra.activity.anonymous, expectedAnonymous);
  assert.equal(extra.activity.time_close > extra.activity.time_open, true);
  assert.equal(typeof extra.activity.completion_submit, 'boolean');
}

test('Feedback module lifecycle works through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const categoryName = `MoodlIA Feedback Category ${suffix}`;
  const courseName = `MoodlIA Feedback Course ${suffix}`;
  const courseShortname = `moodlia-feedback-${suffix}`;
  const sectionName = `MoodlIA Feedback Section ${suffix}`;
  let categoryId = null;
  let courseId = null;
  let sectionDeleted = false;
  let restFeedbackDeleted = false;
  let mcpFeedbackDeleted = false;
  let cliFeedbackDeleted = false;
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
      summary: `<p>MoodlIA feedback smoke course ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });
    courseId = course.course_id;

    const section = await callRestFunction(toRestFunctionName(contract, 'create_section'), {
      course_id: courseId,
      name: sectionName
    });

    const restFeedback = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'feedback',
      name: `MoodlIA REST Feedback ${suffix}`,
      options: JSON.stringify(feedbackOptions(suffix))
    });
    assert.equal(restFeedback.module_type, 'feedback');
    assert.match(restFeedback.url, /\/mod\/feedback\/view\.php\?id=/);

    const restDetails = await callRestFunction(toRestFunctionName(contract, 'get_module_details'), {
      course_id: courseId,
      module_id: restFeedback.course_module_id
    });
    assertFeedbackDetails(restDetails, restFeedback, 2);

    const mcpFeedback = await callMcpTool('create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'feedback',
      name: `MoodlIA MCP Feedback ${suffix}`,
      options: feedbackOptions(suffix, { anonymous: 'anonymous', multiple_submit: false })
    });
    assert.equal(mcpFeedback.module_type, 'feedback');

    const mcpDetails = await callMcpTool('get_module_details', {
      course_id: courseId,
      module_id: mcpFeedback.course_module_id
    });
    assertFeedbackDetails(mcpDetails, mcpFeedback, 1);

    const cliFeedback = await callCli([
      'create-module',
      '--course-id', String(courseId),
      '--section-number', String(section.section_number),
      '--module-type', 'feedback',
      '--name', `MoodlIA CLI Feedback ${suffix}`,
      '--options', JSON.stringify(feedbackOptions(suffix, { publish_stats: false }))
    ]);
    assert.equal(cliFeedback.module_type, 'feedback');

    const cliDetails = await callCli([
      'get-module-details',
      '--course-id', String(courseId),
      '--module-id', String(cliFeedback.course_module_id)
    ]);
    assertFeedbackDetails(cliDetails, cliFeedback, 2);

    const deletedCliFeedback = await callCli([
      'delete-module',
      '--course-id', String(courseId),
      '--module-id', String(cliFeedback.course_module_id)
    ]);
    assert.equal(deletedCliFeedback.deleted, true);
    cliFeedbackDeleted = true;

    const deletedMcpFeedback = await callMcpTool('delete_module', {
      course_id: courseId,
      module_id: mcpFeedback.course_module_id
    });
    assert.equal(deletedMcpFeedback.deleted, true);
    mcpFeedbackDeleted = true;

    const deletedRestFeedback = await callRestFunction(toRestFunctionName(contract, 'delete_module'), {
      course_id: courseId,
      module_id: restFeedback.course_module_id
    });
    assert.equal(deletedRestFeedback.deleted, true);
    restFeedbackDeleted = true;

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
      console.error(`Generated feedback course left in Moodle for inspection: ${courseId}`);
      if (!restFeedbackDeleted) {
        console.error('REST feedback cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!mcpFeedbackDeleted) {
        console.error('MCP feedback cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!cliFeedbackDeleted) {
        console.error('CLI feedback cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!sectionDeleted) {
        console.error('Feedback section cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
    }
    if (categoryId && !categoryDeleted) {
      console.error(`Generated feedback course category left in Moodle for inspection: ${categoryId}`);
    }
    throw error;
  }
});
