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

function calculatedOptions(overrides = {}) {
  return {
    answers: [
      {
        formula: '{a} + {b}',
        fraction: 1,
        tolerance: 0.01,
        tolerance_type: 1,
        correct_answer_length: 2,
        correct_answer_format: 1,
        feedback: '<p>Correct formula.</p>'
      },
      {
        formula: '{a} - {b}',
        fraction: 0,
        tolerance: 0.01,
        tolerance_type: 1,
        correct_answer_length: 2,
        correct_answer_format: 1,
        feedback: '<p>Add both values.</p>'
      }
    ],
    variables: [
      { name: 'a', min: 1, max: 9, decimals: 1, distribution: 'uniform' },
      { name: 'b', min: 2, max: 10, decimals: 1, distribution: 'uniform' }
    ],
    dataset_values: [
      { a: 1.5, b: 2.5 },
      { a: 3.2, b: 4.8 },
      { a: 6.4, b: 1.6 }
    ],
    general_feedback: '<p>The sum is {={a} + {b}}.</p>',
    ...overrides
  };
}

function assertQuestion(question, expected) {
  assert.equal(question.category_id, expected.categoryId);
  assert.equal(question.question_type, 'calculatedsimple');
  assert.equal(question.name, expected.name);
}

function assertListedQuestion(questions, expected) {
  const found = questions.find((question) => question.question_id === expected.questionId);
  assert.ok(found, `Question ${expected.questionId} should be listed`);
  assertQuestion(found, expected);
}

test('Simple calculated questions work through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const callRest = (operation, parameters = {}) =>
    callRestFunction(toRestFunctionName(contract, operation), parameters);

  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let category = null;
  let course = null;
  let success = false;

  try {
    category = await callRest('create_course_category', {
      name: `MoodlIA CalculatedSimple Category ${suffix}`,
      visible: 1
    });

    course = await callRest('create_course', {
      fullname: `MoodlIA CalculatedSimple Course ${suffix}`,
      shortname: `moodlia-calculatedsimple-${suffix}`,
      category_id: category.category_id,
      visible: 0,
      summary: `<p>MoodlIA calculatedsimple qtype smoke ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });

    const qbank = await callRest('create_module', {
      course_id: course.course_id,
      section_number: 0,
      module_type: 'qbank',
      name: `MoodlIA CalculatedSimple QBank ${suffix}`,
      options: JSON.stringify({
        intro: '<p>Question bank for calculatedsimple qtype smoke.</p>',
        visible: true
      })
    });

    const questionCategory = await callRest('create_question_category', {
      course_id: course.course_id,
      bank_scope: 'course_shared',
      question_bank_module_id: qbank.course_module_id,
      name: `MoodlIA CalculatedSimple Questions ${suffix}`,
      description: 'Simple calculated qtype smoke category.'
    });

    const restName = `MoodlIA REST CalculatedSimple ${suffix}`;
    const restQuestion = await callRest('create_question', {
      category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
      question_type: 'calculatedsimple',
      name: restName,
      question_text: '<p>What is {a} + {b}?</p>',
      options: JSON.stringify(calculatedOptions())
    });
    assertQuestion(restQuestion, {
      categoryId: questionCategory.category_id,
      name: restName
    });

    const mcpName = `MoodlIA MCP CalculatedSimple ${suffix}`;
    const mcpQuestion = await callMcpTool('create_question', {
      category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
      question_type: 'calculatedsimple',
      name: mcpName,
      question_text: '<p>Calculate {x} * {y}.</p>',
      options: calculatedOptions({
        answers: [
          { formula: '{x} * {y}', fraction: 1, tolerance: 0.01 },
          { formula: '{x} + {y}', fraction: 0, tolerance: 0.01 }
        ],
        variables: [
          { name: 'x', min: 2, max: 8, decimals: 1 },
          { name: 'y', min: 3, max: 9, decimals: 1 }
        ],
        dataset_values: [],
        dataset_count: 4
      })
    });
    assertQuestion(mcpQuestion, {
      categoryId: questionCategory.category_id,
      name: mcpName
    });

    const cliName = `MoodlIA CLI CalculatedSimple ${suffix}`;
    const cliQuestion = await callCli([
      'create-question',
      '--category-id', String(questionCategory.category_id),
      '--context-id', String(questionCategory.context_id),
      '--question-type', 'calculatedsimple',
      '--name', cliName,
      '--question-text', '<p>Find {m} - {n}.</p>',
      '--options', JSON.stringify(calculatedOptions({
        answers: [
          { text: '{m} - {n}', fraction: 1, tolerance: 0.01 },
          { text: '{m} + {n}', fraction: 0, tolerance: 0.01 }
        ],
        variables: [
          { name: 'm', min: 10, max: 20, decimals: 1 },
          { name: 'n', min: 1, max: 5, decimals: 1 }
        ],
        dataset_values: [],
        dataset_count: 5
      }))
    ]);
    assertQuestion(cliQuestion, {
      categoryId: questionCategory.category_id,
      name: cliName
    });

    const updatedRestName = `MoodlIA REST CalculatedSimple Updated ${suffix}`;
    const updatedRestQuestion = await callRest('update_question', {
      question_id: restQuestion.question_id,
      name: updatedRestName,
      question_text: '<p>Updated: what is {a} + {b}?</p>',
      options: JSON.stringify(calculatedOptions({
        dataset_values: [
          { a: 2.5, b: 7.5 },
          { a: 4.4, b: 5.6 }
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
      console.error(`CalculatedSimple question course left in Moodle for inspection: ${course.course_id}`);
    }

    if (success && category?.category_id) {
      await callRest('delete_course_category', {
        category_id: category.category_id
      });
    } else if (category?.category_id) {
      console.error(`CalculatedSimple question category left in Moodle for inspection: ${category.category_id}`);
    }
  }
});
