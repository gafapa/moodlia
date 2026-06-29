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

const tinyPngBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAMgAAABkCAYAAABM5OhcAAAACXBIWXMAAAsTAAALEwEAmpwYAAABFklEQVR4nO3RMQ0AMAwAsLx/0S9nCQqgJu5k9MxkNwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4P8B3M4AAZ3UTPoAAAAASUVORK5CYII=';
const tinyDragPngBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAKUlEQVR4nO3NMQEAAAgDILV/5zDAAKcGm5kAAAAAAAAAAAAAAAAAAADgA8kPAAHnMIHGAAAAAElFTkSuQmCC';

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

function imageOrTextOptions(overrides = {}) {
  return {
    background_image_base64: tinyPngBase64,
    background_filename: 'moodlia-ddimageortext-background.png',
    shuffle_answers: false,
    dropzone_visibility: true,
    drags: [
      { type: 'text', label: 'Text label', group: 1, infinite: false },
      {
        type: 'image',
        label: 'Image label',
        group: 1,
        infinite: false,
        image_base64: tinyDragPngBase64,
        image_filename: 'moodlia-ddimageortext-drag.png'
      }
    ],
    drops: [
      { xleft: 35, ytop: 25, choice: 1, label: 'Text target' },
      { xleft: 120, ytop: 40, choice: 2, label: 'Image target' }
    ],
    correct_feedback: '<p>All items placed correctly.</p>',
    partially_correct_feedback: '<p>Some items are in the right place.</p>',
    incorrect_feedback: '<p>Review item placement.</p>',
    ...overrides
  };
}

function assertQuestion(question, expected) {
  assert.equal(question.category_id, expected.categoryId);
  assert.equal(question.question_type, 'ddimageortext');
  assert.equal(question.name, expected.name);
}

function assertListedQuestion(questions, expected) {
  const found = questions.find((question) => question.question_id === expected.questionId);
  assert.ok(found, `Question ${expected.questionId} should be listed`);
  assertQuestion(found, expected);
}

test('Drag-and-drop onto image questions work through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const callRest = (operation, parameters = {}) =>
    callRestFunction(toRestFunctionName(contract, operation), parameters);

  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let category = null;
  let course = null;
  let success = false;

  try {
    category = await callRest('create_course_category', {
      name: `MoodlIA DDImageOrText Category ${suffix}`,
      visible: 1
    });

    course = await callRest('create_course', {
      fullname: `MoodlIA DDImageOrText Course ${suffix}`,
      shortname: `moodlia-ddimageortext-${suffix}`,
      category_id: category.category_id,
      visible: 0,
      summary: `<p>MoodlIA ddimageortext qtype smoke ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });

    const qbank = await callRest('create_module', {
      course_id: course.course_id,
      section_number: 0,
      module_type: 'qbank',
      name: `MoodlIA DDImageOrText QBank ${suffix}`,
      options: JSON.stringify({
        intro: '<p>Question bank for ddimageortext qtype smoke.</p>',
        visible: true
      })
    });

    const questionCategory = await callRest('create_question_category', {
      course_id: course.course_id,
      bank_scope: 'course_shared',
      question_bank_module_id: qbank.course_module_id,
      name: `MoodlIA DDImageOrText Questions ${suffix}`,
      description: 'Drag-and-drop onto image qtype smoke category.'
    });

    const restName = `MoodlIA REST DDImageOrText ${suffix}`;
    const restQuestion = await callRest('create_question', {
      category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
      question_type: 'ddimageortext',
      name: restName,
      question_text: '<p>Drag the text label and image label onto the background.</p>',
      options: JSON.stringify(imageOrTextOptions())
    });
    assertQuestion(restQuestion, {
      categoryId: questionCategory.category_id,
      name: restName
    });

    const mcpName = `MoodlIA MCP DDImageOrText ${suffix}`;
    const mcpQuestion = await callMcpTool('create_question', {
      category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
      question_type: 'ddimageortext',
      name: mcpName,
      question_text: '<p>Place each draggable item in its target box.</p>',
      options: imageOrTextOptions({
        drags: [
          { type: 'text', label: 'First text', group: 1 },
          { type: 'text', label: 'Second text', group: 1 }
        ],
        drops: [
          { x: 30, y: 20, choice: 1, label: 'First target' },
          { x: 140, y: 45, choice: 2, label: 'Second target' }
        ]
      })
    });
    assertQuestion(mcpQuestion, {
      categoryId: questionCategory.category_id,
      name: mcpName
    });

    const cliName = `MoodlIA CLI DDImageOrText ${suffix}`;
    const cliQuestion = await callCli([
      'create-question',
      '--category-id', String(questionCategory.category_id),
      '--context-id', String(questionCategory.context_id),
      '--question-type', 'ddimageortext',
      '--name', cliName,
      '--question-text', '<p>Drop the draggable labels onto the image.</p>',
      '--options', JSON.stringify(imageOrTextOptions({
        shuffle_answers: true,
        dropzone_visibility: false,
        drags: [
          { type: 'text', label: 'Alpha', group: 1 },
          { type: 'text', label: 'Beta', group: 1, infinite: true }
        ],
        drops: [
          { xleft: 45, ytop: 25, choice: 1 },
          { xleft: 110, ytop: 45, choice: 2 }
        ]
      }))
    ]);
    assertQuestion(cliQuestion, {
      categoryId: questionCategory.category_id,
      name: cliName
    });

    const updatedRestName = `MoodlIA REST DDImageOrText Updated ${suffix}`;
    const updatedRestQuestion = await callRest('update_question', {
      question_id: restQuestion.question_id,
      name: updatedRestName,
      question_text: '<p>Place the updated labels on the background image.</p>',
      options: JSON.stringify(imageOrTextOptions({
        drags: [
          { type: 'text', label: 'Updated text one', group: 1 },
          { type: 'text', label: 'Updated text two', group: 1 }
        ],
        drops: [
          { xleft: 50, ytop: 30, choice: 1, label: 'Updated one' },
          { xleft: 135, ytop: 55, choice: 2, label: 'Updated two' }
        ]
      }))
    });
    assertQuestion(updatedRestQuestion, {
      categoryId: questionCategory.category_id,
      name: updatedRestName
    });

    const listed = await callRest('get_questions', {
      course_id: course.course_id,
      category_id: questionCategory.category_id,
      bank_scope: 'course_shared',
      question_bank_module_id: qbank.course_module_id
    });
    assertListedQuestion(listed.questions, {
      questionId: updatedRestQuestion.question_id,
      categoryId: questionCategory.category_id,
      name: updatedRestName
    });
    assertListedQuestion(listed.questions, {
      questionId: mcpQuestion.question_id,
      categoryId: questionCategory.category_id,
      name: mcpName
    });
    assertListedQuestion(listed.questions, {
      questionId: cliQuestion.question_id,
      categoryId: questionCategory.category_id,
      name: cliName
    });

    success = true;
  } finally {
    if (success && course?.course_id) {
      await callRest('delete_course', {
        course_id: course.course_id
      });
    } else if (course?.course_id) {
      console.error(`DDImageOrText question course left in Moodle for inspection: ${course.course_id}`);
    }

    if (success && category?.category_id) {
      await callRest('delete_course_category', {
        category_id: category.category_id
      });
    } else if (category?.category_id) {
      console.error(`DDImageOrText question category left in Moodle for inspection: ${category.category_id}`);
    }
  }
});
