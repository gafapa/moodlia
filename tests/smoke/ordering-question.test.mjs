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

function assertOrderingQuestion(question, expected) {
  assert.equal(question.category_id, expected.categoryId);
  assert.equal(question.question_type, 'ordering');
  assert.equal(question.name, expected.name);
}

function assertListedQuestion(questions, expected) {
  const found = questions.find((question) => question.question_id === expected.questionId);
  assert.ok(found, `Question ${expected.questionId} should be listed`);
  assertOrderingQuestion(found, expected);
}

test('Ordering questions work through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const callRest = (operation, parameters = {}) =>
    callRestFunction(toRestFunctionName(contract, operation), parameters);

  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let category = null;
  let course = null;
  let success = false;

  try {
    category = await callRest('create_course_category', {
      name: `MoodlIA Ordering Category ${suffix}`,
      visible: 1
    });

    course = await callRest('create_course', {
      fullname: `MoodlIA Ordering Course ${suffix}`,
      shortname: `moodlia-ordering-${suffix}`,
      category_id: category.category_id,
      visible: 0,
      summary: `<p>MoodlIA ordering qtype smoke ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });

    const qbank = await callRest('create_module', {
      course_id: course.course_id,
      section_number: 0,
      module_type: 'qbank',
      name: `MoodlIA Ordering QBank ${suffix}`,
      options: JSON.stringify({
        intro: '<p>Question bank for ordering qtype smoke.</p>',
        visible: true
      })
    });

    const questionCategory = await callRest('create_question_category', {
      course_id: course.course_id,
      bank_scope: 'course_shared',
      question_bank_module_id: qbank.course_module_id,
      name: `MoodlIA Ordering Questions ${suffix}`,
      description: 'Ordering qtype smoke category.'
    });

    const restName = `MoodlIA REST Ordering ${suffix}`;
    const restQuestion = await callRest('create_question', {
      category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
      question_type: 'ordering',
      name: restName,
      question_text: `<p>Put the lifecycle steps in order for ${suffix}.</p>`,
      options: JSON.stringify({
        items: ['Plan', 'Build', 'Verify', 'Deploy'],
        layout: 'vertical',
        selection: 'all',
        grading: 'absolute_position',
        numbering_style: 'abc',
        correct_feedback: '<p>Correct ordering.</p>',
        partially_correct_feedback: '<p>Partially correct ordering.</p>',
        incorrect_feedback: '<p>Incorrect ordering.</p>'
      })
    });
    assertOrderingQuestion(restQuestion, {
      categoryId: questionCategory.category_id,
      name: restName
    });

    const mcpName = `MoodlIA MCP Ordering ${suffix}`;
    const mcpQuestion = await callMcpTool('create_question', {
      category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
      question_type: 'ordering',
      name: mcpName,
      question_text: `<p>Put these sizes in order for ${suffix}.</p>`,
      options: {
        items: ['Small', 'Medium', 'Large'],
        layout: 'horizontal',
        selection: 'all',
        grading: 'relative_next_include_last',
        numbering_style: '123'
      }
    });
    assertOrderingQuestion(mcpQuestion, {
      categoryId: questionCategory.category_id,
      name: mcpName
    });

    const cliName = `MoodlIA CLI Ordering ${suffix}`;
    const cliQuestion = await callCli([
      'create-question',
      '--category-id', String(questionCategory.category_id),
      '--context-id', String(questionCategory.context_id),
      '--question-type', 'ordering',
      '--name', cliName,
      '--question-text', `<p>Put these releases in order for ${suffix}.</p>`,
      '--options', JSON.stringify({
        items: ['Alpha', 'Beta', 'Stable'],
        layout: 'vertical',
        selection: 'all',
        grading: 'all_or_nothing',
        numbering_style: 'none'
      })
    ]);
    assertOrderingQuestion(cliQuestion, {
      categoryId: questionCategory.category_id,
      name: cliName
    });

    const updatedName = `MoodlIA REST Ordering Updated ${suffix}`;
    const updatedQuestion = await callRest('update_question', {
      question_id: restQuestion.question_id,
      name: updatedName,
      question_text: `<p>Put the updated lifecycle steps in order for ${suffix}.</p>`,
      options: JSON.stringify({
        items: ['Design', 'Implement', 'Test', 'Release'],
        layout: 'horizontal',
        selection: 'random',
        selection_count: 3,
        grading: 'longest_ordered_subset',
        numbering_style: 'ABCD',
        show_grading: false
      })
    });
    assertOrderingQuestion(updatedQuestion, {
      categoryId: questionCategory.category_id,
      name: updatedName
    });

    const listed = await callRest('get_questions', {
      course_id: course.course_id,
      category_id: questionCategory.category_id,
      bank_scope: 'course_shared',
      question_bank_module_id: qbank.course_module_id
    });
    assertListedQuestion(listed.questions, {
      questionId: updatedQuestion.question_id,
      categoryId: questionCategory.category_id,
      name: updatedName
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
      console.error(`Ordering question course left in Moodle for inspection: ${course.course_id}`);
    }

    if (success && category?.category_id) {
      await callRest('delete_course_category', {
        category_id: category.category_id
      });
    } else if (category?.category_id) {
      console.error(`Ordering question category left in Moodle for inspection: ${category.category_id}`);
    }
  }
});
