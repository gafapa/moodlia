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

function assertRandomShortAnswerMatching(question, expected) {
  assert.equal(question.category_id, expected.categoryId);
  assert.equal(question.question_type, 'randomsamatch');
  assert.equal(question.name, expected.name);
}

function assertListedQuestion(questions, expected) {
  const found = questions.find((question) => question.question_id === expected.questionId);
  assert.ok(found, `Question ${expected.questionId} should be listed`);
  assert.equal(found.category_id, expected.categoryId);
  assert.equal(found.question_type, expected.questionType);
  assert.equal(found.name, expected.name);
}

test('Random short-answer matching questions work through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const callRest = (operation, parameters = {}) =>
    callRestFunction(toRestFunctionName(contract, operation), parameters);

  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let category = null;
  let course = null;
  let success = false;

  try {
    category = await callRest('create_course_category', {
      name: `MoodlIA RandomSAMatch Category ${suffix}`,
      visible: 1
    });

    course = await callRest('create_course', {
      fullname: `MoodlIA RandomSAMatch Course ${suffix}`,
      shortname: `moodlia-randomsamatch-${suffix}`,
      category_id: category.category_id,
      visible: 0,
      summary: `<p>MoodlIA randomsamatch smoke ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });

    const qbank = await callRest('create_module', {
      course_id: course.course_id,
      section_number: 0,
      module_type: 'qbank',
      name: `MoodlIA RandomSAMatch QBank ${suffix}`,
      options: JSON.stringify({
        intro: '<p>Question bank for randomsamatch qtype smoke.</p>',
        visible: true
      })
    });

    const questionCategory = await callRest('create_question_category', {
      course_id: course.course_id,
      bank_scope: 'course_shared',
      question_bank_module_id: qbank.course_module_id,
      name: `MoodlIA RandomSAMatch Questions ${suffix}`,
      description: 'Random short-answer matching smoke category.'
    });

    const shortAnswers = [];
    for (const label of ['Alpha', 'Beta', 'Gamma']) {
      shortAnswers.push(await callRest('create_question', {
        category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
        question_type: 'shortanswer',
        name: `MoodlIA ${label} ShortAnswer ${suffix}`,
        question_text: `<p>Type ${label} for ${suffix}</p>`,
        options: JSON.stringify({
          answers: [
            {
              text: `${label}-${suffix}`,
              fraction: 1,
              feedback: 'Correct.'
            }
          ],
          case_sensitive: false
        })
      }));
    }

    const restName = `MoodlIA REST RandomSAMatch ${suffix}`;
    const restQuestion = await callRest('create_question', {
      category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
      question_type: 'randomsamatch',
      name: restName,
      question_text: `<p>REST random short-answer matching ${suffix}</p>`,
      options: JSON.stringify({
        choose: 2,
        subcats: false,
        correct_feedback: '<p>Correct random match.</p>',
        partially_correct_feedback: '<p>Partially correct random match.</p>',
        incorrect_feedback: '<p>Incorrect random match.</p>'
      })
    });
    assertRandomShortAnswerMatching(restQuestion, {
      categoryId: questionCategory.category_id,
      name: restName
    });

    const mcpName = `MoodlIA MCP RandomSAMatch ${suffix}`;
    const mcpQuestion = await callMcpTool('create_question', {
      category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
      question_type: 'randomsamatch',
      name: mcpName,
      question_text: `<p>MCP random short-answer matching ${suffix}</p>`,
      options: {
        choose: 2,
        subcats: false
      }
    });
    assertRandomShortAnswerMatching(mcpQuestion, {
      categoryId: questionCategory.category_id,
      name: mcpName
    });

    const cliName = `MoodlIA CLI RandomSAMatch ${suffix}`;
    const cliQuestion = await callCli([
      'create-question',
      '--category-id', String(questionCategory.category_id),
      '--context-id', String(questionCategory.context_id),
      '--question-type', 'randomsamatch',
      '--name', cliName,
      '--question-text', `<p>CLI random short-answer matching ${suffix}</p>`,
      '--options', JSON.stringify({
        choose: 2,
        subcats: false
      })
    ]);
    assertRandomShortAnswerMatching(cliQuestion, {
      categoryId: questionCategory.category_id,
      name: cliName
    });

    const updatedName = `MoodlIA REST RandomSAMatch Updated ${suffix}`;
    const updatedQuestion = await callRest('update_question', {
      question_id: restQuestion.question_id,
      name: updatedName,
      question_text: `<p>Updated REST random short-answer matching ${suffix}</p>`,
      options: JSON.stringify({
        choose: 3,
        subcats: false
      })
    });
    assert.equal(updatedQuestion.question_type, 'randomsamatch');
    assert.equal(updatedQuestion.name, updatedName);

    const listed = await callRest('get_questions', {
      course_id: course.course_id,
      category_id: questionCategory.category_id,
      bank_scope: 'course_shared',
      question_bank_module_id: qbank.course_module_id
    });
    for (const shortAnswer of shortAnswers) {
      assertListedQuestion(listed.questions, {
        questionId: shortAnswer.question_id,
        categoryId: questionCategory.category_id,
        questionType: 'shortanswer',
        name: shortAnswer.name
      });
    }
    assertListedQuestion(listed.questions, {
      questionId: updatedQuestion.question_id,
      categoryId: questionCategory.category_id,
      questionType: 'randomsamatch',
      name: updatedName
    });
    assertListedQuestion(listed.questions, {
      questionId: mcpQuestion.question_id,
      categoryId: questionCategory.category_id,
      questionType: 'randomsamatch',
      name: mcpName
    });
    assertListedQuestion(listed.questions, {
      questionId: cliQuestion.question_id,
      categoryId: questionCategory.category_id,
      questionType: 'randomsamatch',
      name: cliName
    });

    success = true;
  } finally {
    if (success && course?.course_id) {
      await callRest('delete_course', {
        course_id: course.course_id
      });
    } else if (course?.course_id) {
      console.error(`RandomSAMatch question course left in Moodle for inspection: ${course.course_id}`);
    }

    if (success && category?.category_id) {
      await callRest('delete_course_category', {
        category_id: category.category_id
      });
    } else if (category?.category_id) {
      console.error(`RandomSAMatch question category left in Moodle for inspection: ${category.category_id}`);
    }
  }
});
