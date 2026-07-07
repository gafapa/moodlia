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

function assertFeedbackItem(payload, feedbackModule, expected) {
  assert.equal(payload.feedback_id, feedbackModule.instance_id);
  assert.equal(payload.module_id, feedbackModule.course_module_id);
  assert.ok(payload.item_id > 0);
  assert.equal(payload.type, expected.type);
  if (expected.name) {
    assert.equal(payload.name, expected.name);
  }
  if (typeof expected.required === 'boolean') {
    assert.equal(payload.required, expected.required);
  }
  if (expected.presentation) {
    assert.equal(payload.presentation, expected.presentation);
  }
  if (expected.dependItemId !== undefined) {
    assert.equal(payload.depend_item_id, expected.dependItemId);
  }
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

    const restTextfield = await callRestFunction(toRestFunctionName(contract, 'create_feedback_item'), {
      course_id: courseId,
      module_id: feedback.course_module_id,
      type: 'textfield',
      name: `MoodlIA Goal ${suffix}`,
      definition: JSON.stringify({ size: 40, max_length: 120 }),
      required: 1,
      label: 'goal'
    });
    assertFeedbackItem(restTextfield, feedback, {
      type: 'textfield',
      name: `MoodlIA Goal ${suffix}`,
      required: true,
      presentation: '40|120'
    });

    const updatedTextfield = await callRestFunction(toRestFunctionName(contract, 'update_feedback_item'), {
      course_id: courseId,
      module_id: feedback.course_module_id,
      item_id: restTextfield.item_id,
      name: `MoodlIA Updated Goal ${suffix}`,
      definition: JSON.stringify({ size: 45, max_length: 160 })
    });
    assertFeedbackItem(updatedTextfield, feedback, {
      type: 'textfield',
      name: `MoodlIA Updated Goal ${suffix}`,
      required: true,
      presentation: '45|160'
    });

    const mcpMultichoice = await callMcpTool('create_feedback_item', {
      course_id: courseId,
      module_id: feedback.course_module_id,
      type: 'multichoice',
      name: `MoodlIA Difficulty ${suffix}`,
      definition: {
        subtype: 'radio',
        choices: ['Easy', 'Appropriate', 'Hard'],
        horizontal: false,
        ignore_empty: true
      },
      required: true
    });
    assertFeedbackItem(mcpMultichoice, feedback, {
      type: 'multichoice',
      name: `MoodlIA Difficulty ${suffix}`,
      required: true,
      presentation: 'r>>>>>Easy|Appropriate|Hard<<<<<0'
    });

    const updatedMultichoice = await callMcpTool('update_feedback_item', {
      course_id: courseId,
      module_id: feedback.course_module_id,
      item_id: mcpMultichoice.item_id,
      definition: {
        subtype: 'dropdown',
        choices: ['Easy', 'Appropriate', 'Hard', 'Too hard'],
        hide_no_select: true
      },
      required: false
    });
    assertFeedbackItem(updatedMultichoice, feedback, {
      type: 'multichoice',
      name: `MoodlIA Difficulty ${suffix}`,
      required: false,
      presentation: 'd>>>>>Easy|Appropriate|Hard|Too hard'
    });

    const cliTextarea = await callCli([
      'create-feedback-item',
      '--course-id', String(courseId),
      '--module-id', String(feedback.course_module_id),
      '--type', 'textarea',
      '--name', `MoodlIA Reflection ${suffix}`,
      '--definition', JSON.stringify({ width: 50, height: 8 })
    ]);
    assertFeedbackItem(cliTextarea, feedback, {
      type: 'textarea',
      name: `MoodlIA Reflection ${suffix}`,
      required: false,
      presentation: '50|8'
    });

    const updatedTextarea = await callCli([
      'update-feedback-item',
      '--course-id', String(courseId),
      '--module-id', String(feedback.course_module_id),
      '--item-id', String(cliTextarea.item_id),
      '--position', '1',
      '--depend-item-id', String(updatedTextfield.item_id),
      '--depend-value', 'Ready'
    ]);
    assertFeedbackItem(updatedTextarea, feedback, {
      type: 'textarea',
      name: `MoodlIA Reflection ${suffix}`,
      presentation: '50|8',
      dependItemId: updatedTextfield.item_id
    });

    const populatedItems = await callRestFunction(toRestFunctionName(contract, 'get_feedback_items'), {
      course_id: courseId,
      module_id: feedback.course_module_id
    });
    assert.equal(populatedItems.course_id, courseId);
    assert.equal(populatedItems.count, 3);
    assert.deepEqual(
      populatedItems.items.map((item) => item.item_id).sort((a, b) => a - b),
      [updatedTextfield.item_id, updatedMultichoice.item_id, updatedTextarea.item_id].sort((a, b) => a - b)
    );

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
