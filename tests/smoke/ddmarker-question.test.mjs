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

function markerOptions(overrides = {}) {
  return {
    background_image_base64: tinyPngBase64,
    background_filename: 'moodlia-ddmarker.png',
    shuffle_answers: false,
    show_misplaced: true,
    drags: [
      { label: 'North marker', count: 1 },
      { label: 'South marker', count: 1 }
    ],
    drops: [
      { shape: 'circle', coords: '40,30;12', choice: 1 },
      { shape: 'rectangle', coords: '120,45;30,18', choice: 2 }
    ],
    correct_feedback: '<p>Markers placed correctly.</p>',
    partially_correct_feedback: '<p>Some markers are correct.</p>',
    incorrect_feedback: '<p>Review marker positions.</p>',
    ...overrides
  };
}

function assertQuestion(question, expected) {
  assert.equal(question.category_id, expected.categoryId);
  assert.equal(question.question_type, 'ddmarker');
  assert.equal(question.name, expected.name);
}

function assertListedQuestion(questions, expected) {
  const found = questions.find((question) => question.question_id === expected.questionId);
  assert.ok(found, `Question ${expected.questionId} should be listed`);
  assertQuestion(found, expected);
}

test('Drag-and-drop marker questions work through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const callRest = (operation, parameters = {}) =>
    callRestFunction(toRestFunctionName(contract, operation), parameters);

  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let category = null;
  let course = null;
  let success = false;

  try {
    category = await callRest('create_course_category', {
      name: `MoodlIA DDMarker Category ${suffix}`,
      visible: 1
    });

    course = await callRest('create_course', {
      fullname: `MoodlIA DDMarker Course ${suffix}`,
      shortname: `moodlia-ddmarker-${suffix}`,
      category_id: category.category_id,
      visible: 0,
      summary: `<p>MoodlIA ddmarker qtype smoke ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });

    const qbank = await callRest('create_module', {
      course_id: course.course_id,
      section_number: 0,
      module_type: 'qbank',
      name: `MoodlIA DDMarker QBank ${suffix}`,
      options: JSON.stringify({
        intro: '<p>Question bank for ddmarker qtype smoke.</p>',
        visible: true
      })
    });

    const questionCategory = await callRest('create_question_category', {
      course_id: course.course_id,
      bank_scope: 'course_shared',
      question_bank_module_id: qbank.course_module_id,
      name: `MoodlIA DDMarker Questions ${suffix}`,
      description: 'Drag-and-drop marker qtype smoke category.'
    });

    const restName = `MoodlIA REST DDMarker ${suffix}`;
    const restQuestion = await callRest('create_question', {
      category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
      question_type: 'ddmarker',
      name: restName,
      question_text: '<p>Place the two markers on the background image.</p>',
      options: JSON.stringify(markerOptions())
    });
    assertQuestion(restQuestion, {
      categoryId: questionCategory.category_id,
      name: restName
    });

    const mcpName = `MoodlIA MCP DDMarker ${suffix}`;
    const mcpQuestion = await callMcpTool('create_question', {
      category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
      question_type: 'ddmarker',
      name: mcpName,
      question_text: '<p>Drop each marker in its matching region.</p>',
      options: markerOptions({
        drags: [
          { label: 'Left marker', count: 1 },
          { label: 'Right marker', count: 1 }
        ],
        drops: [
          { shape: 'circle', coords: '35,35;10', choice: 1 },
          { shape: 'circle', coords: '150,35;10', choice: 2 }
        ]
      })
    });
    assertQuestion(mcpQuestion, {
      categoryId: questionCategory.category_id,
      name: mcpName
    });

    const cliName = `MoodlIA CLI DDMarker ${suffix}`;
    const cliQuestion = await callCli([
      'create-question',
      '--category-id', String(questionCategory.category_id),
      '--context-id', String(questionCategory.context_id),
      '--question-type', 'ddmarker',
      '--name', cliName,
      '--question-text', '<p>Place markers in the indicated zones.</p>',
      '--options', JSON.stringify(markerOptions({
        show_misplaced: false,
        drops: [
          { shape: 'circle', coords: '50,50;15', choice: 1 },
          { shape: 'polygon', coords: '130,20;170,20;170,60;130,60', choice: 2 }
        ]
      }))
    ]);
    assertQuestion(cliQuestion, {
      categoryId: questionCategory.category_id,
      name: cliName
    });

    const updatedRestName = `MoodlIA REST DDMarker Updated ${suffix}`;
    const updatedRestQuestion = await callRest('update_question', {
      question_id: restQuestion.question_id,
      name: updatedRestName,
      question_text: '<p>Place the updated markers on the background image.</p>',
      options: JSON.stringify(markerOptions({
        drags: [
          { label: 'Updated one', count: 1 },
          { label: 'Updated two', count: 1 }
        ],
        drops: [
          { shape: 'circle', coords: '45,25;10', choice: 1 },
          { shape: 'rectangle', coords: '110,40;25,20', choice: 2 }
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
      console.error(`DDMarker question course left in Moodle for inspection: ${course.course_id}`);
    }

    if (success && category?.category_id) {
      await callRest('delete_course_category', {
        category_id: category.category_id
      });
    } else if (category?.category_id) {
      console.error(`DDMarker question category left in Moodle for inspection: ${category.category_id}`);
    }
  }
});
