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

function assertQuestion(question, expected) {
  assert.equal(question.category_id, expected.categoryId);
  assert.equal(question.question_type, expected.questionType);
  assert.equal(question.name, expected.name);
}

function assertListedQuestion(questions, expected) {
  const found = questions.find((question) => question.question_id === expected.questionId);
  assert.ok(found, `Question ${expected.questionId} should be listed`);
  assertQuestion(found, expected);
}

function gapselectOptions(choices, shuffleAnswers = false) {
  return {
    shuffle_answers: shuffleAnswers,
    choices: choices.map((answer) => ({ answer, group: 1 })),
    correct_feedback: '<p>Correct selected words.</p>',
    partially_correct_feedback: '<p>Some selected words are correct.</p>',
    incorrect_feedback: '<p>Review the selected words.</p>'
  };
}

function ddwtosOptions(choices, shuffleAnswers = false) {
  return {
    shuffle_answers: shuffleAnswers,
    choices: choices.map((answer) => ({ answer, group: 1 }))
  };
}

test('Embedded-choice questions work through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const callRest = (operation, parameters = {}) =>
    callRestFunction(toRestFunctionName(contract, operation), parameters);

  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let category = null;
  let course = null;
  let success = false;

  try {
    category = await callRest('create_course_category', {
      name: `MoodlIA Embedded Choice Category ${suffix}`,
      visible: 1
    });

    course = await callRest('create_course', {
      fullname: `MoodlIA Embedded Choice Course ${suffix}`,
      shortname: `moodlia-embedded-choice-${suffix}`,
      category_id: category.category_id,
      visible: 0,
      summary: `<p>MoodlIA embedded choice qtype smoke ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });

    const qbank = await callRest('create_module', {
      course_id: course.course_id,
      section_number: 0,
      module_type: 'qbank',
      name: `MoodlIA Embedded Choice QBank ${suffix}`,
      options: JSON.stringify({
        intro: '<p>Question bank for embedded choice qtype smoke.</p>',
        visible: true
      })
    });

    const questionCategory = await callRest('create_question_category', {
      course_id: course.course_id,
      bank_scope: 'course_shared',
      question_bank_module_id: qbank.course_module_id,
      name: `MoodlIA Embedded Choice Questions ${suffix}`,
      description: 'Embedded choice qtype smoke category.'
    });

    const quiz = await callRest('create_module', {
      course_id: course.course_id,
      section_number: 1,
      module_type: 'quiz',
      name: `MoodlIA Embedded Choice Quiz ${suffix}`,
      options: JSON.stringify({
        intro: '<p>Quiz for embedded choice qtype smoke.</p>',
        max_grade: 10
      })
    });

    const gapselectName = `MoodlIA REST Gapselect ${suffix}`;
    const gapselectQuestion = await callRest('create_question', {
      category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
      question_type: 'gapselect',
      name: gapselectName,
      question_text: `<p>The capital of France is [[1]] and the capital of Spain is [[2]].</p>`,
      options: JSON.stringify(gapselectOptions(['Paris', 'Madrid', 'Rome']))
    });
    assertQuestion(gapselectQuestion, {
      categoryId: questionCategory.category_id,
      questionType: 'gapselect',
      name: gapselectName
    });

    const restDdwtosName = `MoodlIA REST DDWTOS ${suffix}`;
    const restDdwtosQuestion = await callRest('create_question', {
      category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
      question_type: 'ddwtos',
      name: restDdwtosName,
      question_text: `<p>Drag [[1]] before dragging [[2]].</p>`,
      options: JSON.stringify(ddwtosOptions(['first', 'second', 'unused']))
    });
    assertQuestion(restDdwtosQuestion, {
      categoryId: questionCategory.category_id,
      questionType: 'ddwtos',
      name: restDdwtosName
    });

    const mcpGapselectName = `MoodlIA MCP Gapselect ${suffix}`;
    const mcpGapselectQuestion = await callMcpTool('create_question', {
      category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
      question_type: 'gapselect',
      name: mcpGapselectName,
      question_text: `<p>Select [[1]] and then [[2]].</p>`,
      options: gapselectOptions(['alpha', 'beta', 'gamma'], true)
    });
    assertQuestion(mcpGapselectQuestion, {
      categoryId: questionCategory.category_id,
      questionType: 'gapselect',
      name: mcpGapselectName
    });

    const mcpDdwtosName = `MoodlIA MCP DDWTOS ${suffix}`;
    const mcpDdwtosQuestion = await callMcpTool('create_question', {
      category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
      question_type: 'ddwtos',
      name: mcpDdwtosName,
      question_text: `<p>Drag [[1]] before dragging [[2]].</p>`,
      options: ddwtosOptions(['first', 'second', 'unused'])
    });
    assertQuestion(mcpDdwtosQuestion, {
      categoryId: questionCategory.category_id,
      questionType: 'ddwtos',
      name: mcpDdwtosName
    });

    const cliGapselectName = `MoodlIA CLI Gapselect ${suffix}`;
    const cliGapselectQuestion = await callCli([
      'create-question',
      '--category-id', String(questionCategory.category_id),
      '--context-id', String(questionCategory.context_id),
      '--question-type', 'gapselect',
      '--name', cliGapselectName,
      '--question-text', `<p>Choose [[1]], then [[2]].</p>`,
      '--options', JSON.stringify(gapselectOptions(['north', 'south', 'east']))
    ]);
    assertQuestion(cliGapselectQuestion, {
      categoryId: questionCategory.category_id,
      questionType: 'gapselect',
      name: cliGapselectName
    });

    const cliDdwtosName = `MoodlIA CLI DDWTOS ${suffix}`;
    const cliDdwtosQuestion = await callCli([
      'create-question',
      '--category-id', String(questionCategory.category_id),
      '--context-id', String(questionCategory.context_id),
      '--question-type', 'ddwtos',
      '--name', cliDdwtosName,
      '--question-text', `<p>Use [[1]] and then [[2]].</p>`,
      '--options', JSON.stringify(ddwtosOptions(['alpha', 'beta', 'gamma'], true))
    ]);
    assertQuestion(cliDdwtosQuestion, {
      categoryId: questionCategory.category_id,
      questionType: 'ddwtos',
      name: cliDdwtosName
    });

    const updatedGapselectName = `MoodlIA REST Gapselect Updated ${suffix}`;
    const updatedGapselectQuestion = await callRest('update_question', {
      question_id: gapselectQuestion.question_id,
      name: updatedGapselectName,
      question_text: `<p>Choose [[1]], then choose [[2]].</p>`,
      options: JSON.stringify(gapselectOptions(['one', 'two', 'three'], true))
    });
    assertQuestion(updatedGapselectQuestion, {
      categoryId: questionCategory.category_id,
      questionType: 'gapselect',
      name: updatedGapselectName
    });

    const createdQuestions = [
      updatedGapselectQuestion,
      restDdwtosQuestion,
      mcpGapselectQuestion,
      mcpDdwtosQuestion,
      cliGapselectQuestion,
      cliDdwtosQuestion
    ];

    for (const [index, question] of createdQuestions.entries()) {
      const added = await callRest('add_question_to_quiz', {
        quiz_module_id: quiz.course_module_id,
        question_id: question.question_id,
        slot: index + 1
      });
      assert.equal(added.question_id, question.question_id);
      assert.equal(added.slot, index + 1);
      assert.ok(added.maxmark > 0, 'embedded-choice quiz slots must have a positive max mark');
    }

    const quizQuestions = await callRest('get_quiz_questions', {
      quiz_module_id: quiz.course_module_id
    });
    assert.equal(quizQuestions.quiz_module_id, quiz.course_module_id);
    assert.ok(
      Array.isArray(quizQuestions.questions),
      'get_quiz_questions must expose quiz slots through a questions array'
    );
    assert.ok(
      quizQuestions.questions.length >= createdQuestions.length,
      'get_quiz_questions must include every embedded-choice slot added by the test'
    );
    for (const question of createdQuestions) {
      assert.ok(
        quizQuestions.questions.some((slot) =>
          slot.question_id === question.question_id &&
          slot.question_type === question.question_type &&
          slot.name === question.name
        ),
        `${question.question_type} question ${question.question_id} must be present as a quiz slot`
      );
    }

    const listed = await callRest('get_questions', {
      course_id: course.course_id,
      category_id: questionCategory.category_id,
      bank_scope: 'course_shared',
      question_bank_module_id: qbank.course_module_id
    });
    assertListedQuestion(listed.questions, {
      questionId: updatedGapselectQuestion.question_id,
      categoryId: questionCategory.category_id,
      questionType: 'gapselect',
      name: updatedGapselectName
    });
    assertListedQuestion(listed.questions, {
      questionId: restDdwtosQuestion.question_id,
      categoryId: questionCategory.category_id,
      questionType: 'ddwtos',
      name: restDdwtosName
    });
    assertListedQuestion(listed.questions, {
      questionId: mcpGapselectQuestion.question_id,
      categoryId: questionCategory.category_id,
      questionType: 'gapselect',
      name: mcpGapselectName
    });
    assertListedQuestion(listed.questions, {
      questionId: mcpDdwtosQuestion.question_id,
      categoryId: questionCategory.category_id,
      questionType: 'ddwtos',
      name: mcpDdwtosName
    });
    assertListedQuestion(listed.questions, {
      questionId: cliGapselectQuestion.question_id,
      categoryId: questionCategory.category_id,
      questionType: 'gapselect',
      name: cliGapselectName
    });
    assertListedQuestion(listed.questions, {
      questionId: cliDdwtosQuestion.question_id,
      categoryId: questionCategory.category_id,
      questionType: 'ddwtos',
      name: cliDdwtosName
    });

    success = true;
  } finally {
    if (success && course?.course_id) {
      await callRest('delete_course', {
        course_id: course.course_id
      });
    } else if (course?.course_id) {
      console.error(`Embedded-choice question course left in Moodle for inspection: ${course.course_id}`);
    }

    if (success && category?.category_id) {
      await callRest('delete_course_category', {
        category_id: category.category_id
      });
    } else if (category?.category_id) {
      console.error(`Embedded-choice question category left in Moodle for inspection: ${category.category_id}`);
    }
  }
});
