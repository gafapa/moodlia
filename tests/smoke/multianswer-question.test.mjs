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

function assertMultianswerQuestion(question, expected) {
  assert.equal(question.category_id, expected.categoryId);
  assert.equal(question.question_type, 'multianswer');
  assert.equal(question.name, expected.name);
}

function assertListedQuestion(questions, expected) {
  const found = questions.find((question) => question.question_id === expected.questionId);
  assert.ok(found, `Question ${expected.questionId} should be listed`);
  assertMultianswerQuestion(found, expected);
}

test('Multianswer Cloze questions work through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const callRest = (operation, parameters = {}) =>
    callRestFunction(toRestFunctionName(contract, operation), parameters);

  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let category = null;
  let course = null;
  let success = false;

  try {
    category = await callRest('create_course_category', {
      name: `MoodlIA Multianswer Category ${suffix}`,
      visible: 1
    });

    course = await callRest('create_course', {
      fullname: `MoodlIA Multianswer Course ${suffix}`,
      shortname: `moodlia-multianswer-${suffix}`,
      category_id: category.category_id,
      visible: 0,
      summary: `<p>MoodlIA multianswer qtype smoke ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });

    const qbank = await callRest('create_module', {
      course_id: course.course_id,
      section_number: 0,
      module_type: 'qbank',
      name: `MoodlIA Multianswer QBank ${suffix}`,
      options: JSON.stringify({
        intro: '<p>Question bank for multianswer qtype smoke.</p>',
        visible: true
      })
    });

    const questionCategory = await callRest('create_question_category', {
      course_id: course.course_id,
      bank_scope: 'course_shared',
      question_bank_module_id: qbank.course_module_id,
      name: `MoodlIA Multianswer Questions ${suffix}`,
      description: 'Multianswer qtype smoke category.'
    });

    const restName = `MoodlIA REST Multianswer ${suffix}`;
    const restQuestion = await callRest('create_question', {
      category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
      question_type: 'multianswer',
      name: restName,
      question_text: `<p>Paris is in {1:SHORTANSWER:=France~Spain} and 2 + 2 is {1:NUMERICAL:=4:0}.</p>`,
      options: JSON.stringify({
        general_feedback: '<p>Created through REST.</p>'
      })
    });
    assertMultianswerQuestion(restQuestion, {
      categoryId: questionCategory.category_id,
      name: restName
    });

    const mcpName = `MoodlIA MCP Multianswer ${suffix}`;
    const mcpQuestion = await callMcpTool('create_question', {
      category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
      question_type: 'multianswer',
      name: mcpName,
      question_text: `<p>The sky is {1:SHORTANSWER:=blue~green} and 3 + 3 is {1:NUMERICAL:=6:0}.</p>`,
      options: {
        general_feedback: '<p>Created through MCP.</p>'
      }
    });
    assertMultianswerQuestion(mcpQuestion, {
      categoryId: questionCategory.category_id,
      name: mcpName
    });

    const cliName = `MoodlIA CLI Multianswer ${suffix}`;
    const cliQuestion = await callCli([
      'create-question',
      '--category-id', String(questionCategory.category_id),
      '--context-id', String(questionCategory.context_id),
      '--question-type', 'multianswer',
      '--name', cliName,
      '--question-text', `<p>Water freezes at {1:NUMERICAL:=0:0} Celsius and boils at {1:NUMERICAL:=100:0} Celsius.</p>`,
      '--options', JSON.stringify({
        general_feedback: '<p>Created through CLI.</p>'
      })
    ]);
    assertMultianswerQuestion(cliQuestion, {
      categoryId: questionCategory.category_id,
      name: cliName
    });

    const updatedName = `MoodlIA REST Multianswer Updated ${suffix}`;
    const updatedQuestion = await callRest('update_question', {
      question_id: restQuestion.question_id,
      name: updatedName,
      question_text: `<p>Madrid is in {1:SHORTANSWER:=Spain~France} and 5 + 5 is {1:NUMERICAL:=10:0}.</p>`,
      options: JSON.stringify({
        general_feedback: '<p>Updated through REST.</p>'
      })
    });
    assertMultianswerQuestion(updatedQuestion, {
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
      console.error(`Multianswer question course left in Moodle for inspection: ${course.course_id}`);
    }

    if (success && category?.category_id) {
      await callRest('delete_course_category', {
        category_id: category.category_id
      });
    } else if (category?.category_id) {
      console.error(`Multianswer question category left in Moodle for inspection: ${category.category_id}`);
    }
  }
});
