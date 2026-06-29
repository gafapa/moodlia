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

function assertFeedbackPageItems(payload, courseId, feedbackModule) {
  assert.equal(payload.course_id, courseId);
  assert.equal(payload.module_id, feedbackModule.course_module_id);
  assert.equal(payload.feedback_id, feedbackModule.instance_id);
  assert.equal(payload.page, 0);
  assert.equal(Number.isInteger(payload.count), true);
  assert.equal(typeof payload.has_previous_page, 'boolean');
  assert.equal(typeof payload.has_next_page, 'boolean');
  assert.equal(Array.isArray(payload.items), true);
  assert.equal(Array.isArray(payload.warnings), true);
}

function assertFeedbackAnalysis(payload, courseId, feedbackModule) {
  assert.equal(payload.course_id, courseId);
  assert.equal(payload.module_id, feedbackModule.course_module_id);
  assert.equal(payload.feedback_id, feedbackModule.instance_id);
  assert.equal(payload.group_id, 0);
  assert.equal(Number.isInteger(payload.completed_count), true);
  assert.equal(Number.isInteger(payload.items_count), true);
  assert.equal(Array.isArray(payload.items_data), true);
  assert.equal(Array.isArray(payload.warnings), true);
  for (const entry of payload.items_data) {
    assert.equal(typeof entry.data_json, 'string');
    JSON.parse(entry.data_json);
  }
}

function assertFinishedResponses(payload, courseId, feedbackModule) {
  assert.equal(payload.course_id, courseId);
  assert.equal(payload.module_id, feedbackModule.course_module_id);
  assert.equal(payload.feedback_id, feedbackModule.instance_id);
  assert.equal(Number.isInteger(payload.count), true);
  assert.equal(Array.isArray(payload.responses), true);
  assert.equal(Array.isArray(payload.warnings), true);
}

test('Feedback subelement reads work through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const categoryName = `MoodlIA Feedback Subelements Category ${suffix}`;
  const courseName = `MoodlIA Feedback Subelements Course ${suffix}`;
  const courseShortname = `moodlia-feedback-subelements-${suffix}`;
  const sectionName = `MoodlIA Feedback Subelements Section ${suffix}`;
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
      summary: `<p>MoodlIA feedback subelement smoke course ${suffix}</p>`,
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
      name: `MoodlIA Feedback Subelements ${suffix}`,
      options: JSON.stringify({
        intro: `<p>MoodlIA feedback subelement intro ${suffix}</p>`,
        anonymous: 'non_anonymous',
        multiple_submit: true,
        publish_stats: true
      })
    });
    assert.equal(feedback.module_type, 'feedback');

    const restPageItems = await callRestFunction(toRestFunctionName(contract, 'get_feedback_page_items'), {
      course_id: courseId,
      module_id: feedback.course_module_id,
      page: 0
    });
    assertFeedbackPageItems(restPageItems, courseId, feedback);

    const mcpPageItems = await callMcpTool('get_feedback_page_items', {
      course_id: courseId,
      module_id: feedback.course_module_id,
      page: 0
    });
    assertFeedbackPageItems(mcpPageItems, courseId, feedback);

    const cliPageItems = await callCli([
      'get-feedback-page-items',
      '--course-id', String(courseId),
      '--module-id', String(feedback.course_module_id),
      '--page', '0'
    ]);
    assertFeedbackPageItems(cliPageItems, courseId, feedback);

    const restAnalysis = await callRestFunction(toRestFunctionName(contract, 'get_feedback_analysis'), {
      course_id: courseId,
      module_id: feedback.course_module_id,
      group_id: 0
    });
    assertFeedbackAnalysis(restAnalysis, courseId, feedback);

    const mcpAnalysis = await callMcpTool('get_feedback_analysis', {
      course_id: courseId,
      module_id: feedback.course_module_id,
      group_id: 0
    });
    assertFeedbackAnalysis(mcpAnalysis, courseId, feedback);

    const cliAnalysis = await callCli([
      'get-feedback-analysis',
      '--course-id', String(courseId),
      '--module-id', String(feedback.course_module_id),
      '--group-id', '0'
    ]);
    assertFeedbackAnalysis(cliAnalysis, courseId, feedback);

    const restResponses = await callRestFunction(toRestFunctionName(contract, 'get_feedback_finished_responses'), {
      course_id: courseId,
      module_id: feedback.course_module_id
    });
    assertFinishedResponses(restResponses, courseId, feedback);

    const mcpResponses = await callMcpTool('get_feedback_finished_responses', {
      course_id: courseId,
      module_id: feedback.course_module_id
    });
    assertFinishedResponses(mcpResponses, courseId, feedback);

    const cliResponses = await callCli([
      'get-feedback-finished-responses',
      '--course-id', String(courseId),
      '--module-id', String(feedback.course_module_id)
    ]);
    assertFinishedResponses(cliResponses, courseId, feedback);

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
      console.error(`Generated feedback subelements course left in Moodle for inspection: ${courseId}`);
      if (!feedbackDeleted) {
        console.error('Feedback cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!sectionDeleted) {
        console.error('Feedback subelements section cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
    }
    if (categoryId && !categoryDeleted) {
      console.error(`Generated feedback subelements course category left in Moodle for inspection: ${categoryId}`);
    }
    throw error;
  }
});
