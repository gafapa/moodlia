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

function assertDescriptionQuestion(question, expected) {
  assert.equal(question.category_id, expected.categoryId);
  assert.equal(question.question_type, 'description');
  assert.equal(question.name, expected.name);
}

function assertListedDescription(questions, expected) {
  const found = questions.find((question) => question.question_id === expected.questionId);
  assert.ok(found, `Description question ${expected.questionId} should be listed`);
  assert.equal(found.category_id, expected.categoryId);
  assert.equal(found.question_type, 'description');
  assert.equal(found.name, expected.name);
  assert.match(found.question_text, expected.textPattern);
  assert.equal(found.default_mark, 0);
}

test('Description questions work through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const callRest = (operation, parameters = {}) =>
    callRestFunction(toRestFunctionName(contract, operation), parameters);

  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let category = null;
  let course = null;
  let success = false;

  try {
    category = await callRest('create_course_category', {
      name: `MoodlIA Description Question Category ${suffix}`,
      visible: 1
    });

    course = await callRest('create_course', {
      fullname: `MoodlIA Description Question Course ${suffix}`,
      shortname: `moodlia-description-question-${suffix}`,
      category_id: category.category_id,
      visible: 0,
      summary: `<p>MoodlIA description question smoke ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });

    const qbank = await callRest('create_module', {
      course_id: course.course_id,
      section_number: 0,
      module_type: 'qbank',
      name: `MoodlIA Description QBank ${suffix}`,
      options: JSON.stringify({
        intro: '<p>Question bank for description qtype smoke.</p>',
        visible: true
      })
    });

    const questionCategory = await callRest('create_question_category', {
      course_id: course.course_id,
      bank_scope: 'course_shared',
      question_bank_module_id: qbank.course_module_id,
      name: `MoodlIA Description Questions ${suffix}`,
      description: 'Description qtype smoke category.'
    });

    const restName = `MoodlIA REST Description ${suffix}`;
    const restText = `REST description text ${suffix}`;
    const restQuestion = await callRest('create_question', {
      category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
      question_type: 'description',
      name: restName,
      question_text: `<p>${restText}</p>`,
      options: JSON.stringify({
        default_mark: 10,
        general_feedback: '<p>Description questions are ungraded.</p>'
      })
    });
    assertDescriptionQuestion(restQuestion, {
      categoryId: questionCategory.category_id,
      name: restName
    });

    const mcpName = `MoodlIA MCP Description ${suffix}`;
    const mcpText = `MCP description text ${suffix}`;
    const mcpQuestion = await callMcpTool('create_question', {
      category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
      question_type: 'description',
      name: mcpName,
      question_text: `<p>${mcpText}</p>`,
      options: {
        general_feedback: '<p>MCP-created description question.</p>'
      }
    });
    assertDescriptionQuestion(mcpQuestion, {
      categoryId: questionCategory.category_id,
      name: mcpName
    });

    const cliName = `MoodlIA CLI Description ${suffix}`;
    const cliText = `CLI description text ${suffix}`;
    const cliQuestion = await callCli([
      'create-question',
      '--category-id', String(questionCategory.category_id),
      '--context-id', String(questionCategory.context_id),
      '--question-type', 'description',
      '--name', cliName,
      '--question-text', `<p>${cliText}</p>`,
      '--options', JSON.stringify({
        general_feedback: '<p>CLI-created description question.</p>'
      })
    ]);
    assertDescriptionQuestion(cliQuestion, {
      categoryId: questionCategory.category_id,
      name: cliName
    });

    const updatedName = `MoodlIA REST Description Updated ${suffix}`;
    const updatedText = `REST updated description text ${suffix}`;
    const updatedQuestion = await callRest('update_question', {
      question_id: restQuestion.question_id,
      name: updatedName,
      question_text: `<p>${updatedText}</p>`,
      options: JSON.stringify({
        general_feedback: '<p>Updated description feedback.</p>'
      })
    });
    assert.equal(typeof updatedQuestion.question_id, 'number');
    assert.equal(updatedQuestion.name, updatedName);

    const listed = await callRest('get_questions', {
      course_id: course.course_id,
      category_id: questionCategory.category_id,
      bank_scope: 'course_shared',
      question_bank_module_id: qbank.course_module_id
    });
    assertListedDescription(listed.questions, {
      questionId: updatedQuestion.question_id,
      categoryId: questionCategory.category_id,
      name: updatedName,
      textPattern: new RegExp(updatedText)
    });
    assertListedDescription(listed.questions, {
      questionId: mcpQuestion.question_id,
      categoryId: questionCategory.category_id,
      name: mcpName,
      textPattern: new RegExp(mcpText)
    });
    assertListedDescription(listed.questions, {
      questionId: cliQuestion.question_id,
      categoryId: questionCategory.category_id,
      name: cliName,
      textPattern: new RegExp(cliText)
    });

    const mcpListed = await callMcpTool('get_questions', {
      course_id: course.course_id,
      category_id: questionCategory.category_id,
      bank_scope: 'course_shared',
      question_bank_module_id: qbank.course_module_id
    });
    assertListedDescription(mcpListed.questions, {
      questionId: updatedQuestion.question_id,
      categoryId: questionCategory.category_id,
      name: updatedName,
      textPattern: new RegExp(updatedText)
    });

    const cliListed = await callCli([
      'get-questions',
      '--course-id', String(course.course_id),
      '--category-id', String(questionCategory.category_id),
      '--bank-scope', 'course_shared',
      '--question-bank-module-id', String(qbank.course_module_id)
    ]);
    assertListedDescription(cliListed.questions, {
      questionId: cliQuestion.question_id,
      categoryId: questionCategory.category_id,
      name: cliName,
      textPattern: new RegExp(cliText)
    });

    success = true;
  } finally {
    if (success && course?.course_id) {
      await callRest('delete_course', {
        course_id: course.course_id
      });
    } else if (course?.course_id) {
      console.error(`Description question course left in Moodle for inspection: ${course.course_id}`);
    }

    if (success && category?.category_id) {
      await callRest('delete_course_category', {
        category_id: category.category_id
      });
    } else if (category?.category_id) {
      console.error(`Description question category left in Moodle for inspection: ${category.category_id}`);
    }
  }
});
