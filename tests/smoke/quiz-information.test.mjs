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

function assertAttemptAccess(payload, quiz, attemptId) {
  assert.equal(payload.quiz_module_id, quiz.course_module_id);
  assert.equal(payload.attempt_id, attemptId);
  assert.equal(typeof payload.is_finished, 'boolean');
  assert.equal(typeof payload.is_preflight_check_required, 'boolean');
  assert.equal(Array.isArray(payload.prevent_new_attempt_reasons), true);
  assert.equal(Array.isArray(payload.warnings), true);
}

function assertAttemptData(payload, quiz, attemptId) {
  assert.equal(payload.quiz_module_id, quiz.course_module_id);
  assert.equal(payload.attempt.attempt_id, attemptId);
  assert.equal(payload.page, 0);
  assert.equal(Array.isArray(payload.messages), true);
  assert.equal(Array.isArray(payload.questions), true);
  assert.ok(payload.questions.length > 0, 'Attempt data should include rendered questions.');
  assert.ok(payload.questions.some((question) => question.question_type === 'truefalse'));
  for (const question of payload.questions) {
    assert.equal(typeof question.slot, 'number');
    assert.equal(typeof question.question_number, 'string');
    assert.equal(typeof question.html, 'string');
    assert.equal(typeof question.flagged, 'boolean');
    assert.equal(typeof question.response_file_area_count, 'number');
  }
  assert.equal(Array.isArray(payload.warnings), true);
}

function assertAttemptSummary(payload, quiz, attemptId) {
  assert.equal(payload.quiz_module_id, quiz.course_module_id);
  assert.equal(payload.attempt_id, attemptId);
  assert.equal(typeof payload.total_unanswered, 'number');
  assert.equal(Array.isArray(payload.questions), true);
  assert.ok(payload.questions.length > 0, 'Attempt summary should include question rows.');
  assert.equal(Array.isArray(payload.warnings), true);
}

function assertAttemptView(payload, quiz, attemptId, page = null) {
  assert.equal(payload.quiz_module_id, quiz.course_module_id);
  assert.equal(payload.attempt_id, attemptId);
  if (page !== null) {
    assert.equal(payload.page, page);
  }
  assert.equal(payload.viewed, true);
  assert.equal(Array.isArray(payload.warnings), true);
}

function assertAttemptSave(payload, quiz, attemptId) {
  assert.equal(payload.quiz_module_id, quiz.course_module_id);
  assert.equal(payload.attempt_id, attemptId);
  assert.equal(payload.saved, true);
  assert.equal(Array.isArray(payload.warnings), true);
}

function assertAttemptProcess(payload, quiz, attemptId) {
  assert.equal(payload.quiz_module_id, quiz.course_module_id);
  assert.equal(payload.attempt_id, attemptId);
  assert.equal(payload.state, 'finished');
  assert.equal(payload.finished, true);
  assert.equal(Array.isArray(payload.warnings), true);
}

function assertAttemptReview(payload, quiz, attemptId) {
  assert.equal(payload.quiz_module_id, quiz.course_module_id);
  assert.equal(payload.attempt.attempt_id, attemptId);
  assert.equal(payload.attempt.state, 'finished');
  assert.equal(typeof payload.grade, 'string');
  assert.equal(typeof payload.page, 'number');
  assert.equal(Array.isArray(payload.additional_data), true);
  assert.equal(Array.isArray(payload.questions), true);
  assert.ok(payload.questions.length > 0, 'Attempt review should include reviewed question rows.');
  assert.ok(payload.questions.some((question) => question.question_type === 'truefalse'));
  for (const question of payload.questions) {
    assert.equal(typeof question.html, 'string');
    assert.equal(typeof question.status, 'string');
    assert.equal(typeof question.mark, 'string');
  }
  assert.equal(Array.isArray(payload.warnings), true);
}

function assertCourseQuizzes(payload, course, quiz) {
  assert.deepEqual(payload.course_ids, [course.course_id]);
  assert.equal(typeof payload.count, 'number');
  assert.equal(Array.isArray(payload.quizzes), true);
  const found = payload.quizzes.find((candidate) => candidate.quiz_module_id === quiz.course_module_id);
  assert.ok(found, 'Course quiz listing should include the generated quiz.');
  assert.equal(found.course_id, course.course_id);
  assert.equal(found.quiz_id, quiz.instance_id);
  assert.equal(typeof found.name, 'string');
  assert.equal(typeof found.url, 'string');
  assert.equal(typeof found.attempts_allowed, 'number');
  assert.equal(typeof found.has_feedback, 'boolean');
  assert.equal(Array.isArray(payload.warnings), true);
}

function assertCombinedReviewOptions(payload, quiz) {
  assert.equal(payload.quiz_module_id, quiz.course_module_id);
  assert.equal(payload.quiz_id, quiz.instance_id);
  assert.equal(typeof payload.user_id, 'number');
  assert.equal(Array.isArray(payload.some_options), true);
  assert.equal(Array.isArray(payload.all_options), true);
  assert.ok(payload.some_options.length > 0 || payload.all_options.length > 0, 'Review options should include Moodle option rows.');
  for (const option of [...payload.some_options, ...payload.all_options]) {
    assert.equal(typeof option.name, 'string');
    assert.equal(typeof option.value, 'boolean');
  }
  assert.equal(Array.isArray(payload.warnings), true);
}

function assertQuizResultsReport(payload, quiz, expectedLimit) {
  assert.equal(payload.quiz_module_id, quiz.course_module_id);
  assert.equal(payload.quiz_id, quiz.instance_id);
  assert.equal(typeof payload.course_id, 'number');
  assert.equal(typeof payload.quiz_name, 'string');
  assert.equal(payload.requested_limit, expectedLimit);
  assert.equal(typeof payload.returned_user_count, 'number');
  assert.equal(typeof payload.total_enrolled_user_count, 'number');
  assert.equal(typeof payload.quiz_grade_max, 'number');
  assert.equal(typeof payload.users_with_attempts_count, 'number');
  assert.equal(typeof payload.users_with_finished_attempts_count, 'number');
  assert.equal(typeof payload.users_with_grades_count, 'number');
  assert.equal(typeof payload.average_best_grade, 'number');
  assert.equal(typeof payload.average_best_grade_percentage, 'number');
  assert.equal(Array.isArray(payload.users), true);
  assert.equal(Array.isArray(payload.warnings), true);
  assert.ok(payload.returned_user_count <= expectedLimit);

  if (payload.users.length > 0) {
    const row = payload.users[0];
    assert.equal(typeof row.user_id, 'number');
    assert.equal(typeof row.username, 'string');
    assert.equal(typeof row.fullname, 'string');
    assert.equal(Array.isArray(row.roles), true);
    assert.equal(typeof row.attempt_count, 'number');
    assert.equal(typeof row.finished_attempt_count, 'number');
    assert.equal(typeof row.in_progress_attempt_count, 'number');
    assert.equal(typeof row.preview_attempt_count, 'number');
    assert.equal(typeof row.last_attempt_state, 'string');
    assert.equal(typeof row.last_attempt_time_start, 'number');
    assert.equal(typeof row.last_attempt_time_finish, 'number');
    assert.equal(typeof row.has_grade, 'boolean');
    assert.equal(typeof row.best_grade, 'number');
    assert.equal(typeof row.grade_to_pass, 'number');
    assert.equal(typeof row.grade_percentage, 'number');
    assert.equal(typeof row.feedback_text, 'string');
    assert.equal(typeof row.feedback_format, 'number');
  }
}

test('Quiz information operations work through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let categoryId = null;
  let courseId = null;

  try {
    const category = await callRestFunction(toRestFunctionName(contract, 'create_course_category'), {
      name: `MoodlIA Quiz Info Category ${suffix}`,
      visible: 1
    });
    categoryId = category.category_id;

    const course = await callRestFunction(toRestFunctionName(contract, 'create_course'), {
      fullname: `MoodlIA Quiz Info Course ${suffix}`,
      shortname: `moodlia-quiz-info-${suffix}`,
      category_id: categoryId,
      visible: 0,
      summary: `<p>MoodlIA quiz information smoke course ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });
    courseId = course.course_id;

    const section = await callRestFunction(toRestFunctionName(contract, 'create_section'), {
      course_id: courseId,
      name: `MoodlIA Quiz Info Section ${suffix}`
    });

    const quiz = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'quiz',
      name: `MoodlIA Quiz Info ${suffix}`,
      options: JSON.stringify({
        intro: '<p>Quiz information smoke.</p>',
        grade: 10,
        time_open: Math.floor(Date.now() / 1000) - 60,
        time_close: Math.floor(Date.now() / 1000) + 86400,
        attempts: 3,
        preferred_behaviour: 'deferredfeedback',
        browser_security: 'none'
      })
    });

    const questionCategory = await callRestFunction(toRestFunctionName(contract, 'create_question_category'), {
      course_id: courseId,
      name: `MoodlIA Quiz Info Questions ${suffix}`,
      bank_scope: 'quiz_private',
      quiz_module_id: quiz.course_module_id,
      description: 'Quiz-private category for information smoke tests.'
    });

    const question = await callRestFunction(toRestFunctionName(contract, 'create_question'), {
      category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
      question_type: 'truefalse',
      name: `MoodlIA Quiz Info Question ${suffix}`,
      question_text: '<p>Does this quiz expose information through MoodlIA?</p>',
      options: JSON.stringify({
        correct_answer: true,
        feedback_true: 'Correct.',
        feedback_false: 'Incorrect.'
      })
    });

    const slot = await callRestFunction(toRestFunctionName(contract, 'add_question_to_quiz'), {
      quiz_module_id: quiz.course_module_id,
      question_id: question.question_id
    });
    assert.equal(slot.question_id, question.question_id);

    const restCourseQuizzes = await callRestFunction(toRestFunctionName(contract, 'get_course_quizzes'), {
      course_ids: JSON.stringify([courseId])
    });
    assertCourseQuizzes(restCourseQuizzes, course, quiz);

    const mcpCourseQuizzes = await callMcpTool('get_course_quizzes', {
      course_ids: JSON.stringify([courseId])
    });
    assertCourseQuizzes(mcpCourseQuizzes, course, quiz);

    const cliCourseQuizzes = await callCli([
      'get-course-quizzes',
      '--course-ids', JSON.stringify([courseId])
    ]);
    assertCourseQuizzes(cliCourseQuizzes, course, quiz);

    const restAccess = await callRestFunction(toRestFunctionName(contract, 'get_quiz_access_information'), {
      quiz_module_id: quiz.course_module_id
    });
    assert.equal(restAccess.quiz_module_id, quiz.course_module_id);
    assert.equal(typeof restAccess.can_preview, 'boolean');
    assert.ok(Array.isArray(restAccess.active_rule_names));

    const mcpAccess = await callMcpTool('get_quiz_access_information', {
      quiz_module_id: quiz.course_module_id
    });
    assert.equal(mcpAccess.quiz_module_id, quiz.course_module_id);
    assert.equal(typeof mcpAccess.can_manage, 'boolean');

    const cliAccess = await callCli([
      'get-quiz-access-information',
      '--quiz-module-id', String(quiz.course_module_id)
    ]);
    assert.equal(cliAccess.quiz_module_id, quiz.course_module_id);
    assert.ok(Array.isArray(cliAccess.prevent_access_reasons));

    const restReviewOptions = await callRestFunction(toRestFunctionName(contract, 'get_quiz_combined_review_options'), {
      quiz_module_id: quiz.course_module_id
    });
    assertCombinedReviewOptions(restReviewOptions, quiz);

    const mcpReviewOptions = await callMcpTool('get_quiz_combined_review_options', {
      quiz_module_id: quiz.course_module_id
    });
    assertCombinedReviewOptions(mcpReviewOptions, quiz);

    const cliReviewOptions = await callCli([
      'get-quiz-combined-review-options',
      '--quiz-module-id', String(quiz.course_module_id)
    ]);
    assertCombinedReviewOptions(cliReviewOptions, quiz);

    const restView = await callRestFunction(toRestFunctionName(contract, 'view_quiz'), {
      quiz_module_id: quiz.course_module_id
    });
    assert.equal(restView.viewed, true);

    const mcpView = await callMcpTool('view_quiz', {
      quiz_module_id: quiz.course_module_id
    });
    assert.equal(mcpView.viewed, true);

    const cliView = await callCli([
      'view-quiz',
      '--quiz-module-id', String(quiz.course_module_id)
    ]);
    assert.equal(cliView.viewed, true);

    const startedAttempt = await callRestFunction(toRestFunctionName(contract, 'start_quiz_attempt'), {
      quiz_module_id: quiz.course_module_id,
      force_new: true
    });
    const attemptId = startedAttempt.attempt.attempt_id;
    assert.equal(startedAttempt.quiz_module_id, quiz.course_module_id);
    assert.ok(attemptId > 0);

    const restAttemptAccess = await callRestFunction(toRestFunctionName(contract, 'get_quiz_attempt_access_information'), {
      quiz_module_id: quiz.course_module_id,
      attempt_id: attemptId
    });
    assertAttemptAccess(restAttemptAccess, quiz, attemptId);

    const restAttemptData = await callRestFunction(toRestFunctionName(contract, 'get_quiz_attempt_data'), {
      quiz_module_id: quiz.course_module_id,
      attempt_id: attemptId,
      page: 0
    });
    assertAttemptData(restAttemptData, quiz, attemptId);

    const restAttemptView = await callRestFunction(toRestFunctionName(contract, 'view_quiz_attempt'), {
      quiz_module_id: quiz.course_module_id,
      attempt_id: attemptId,
      page: 0
    });
    assertAttemptView(restAttemptView, quiz, attemptId, 0);

    const restAttemptSummary = await callRestFunction(toRestFunctionName(contract, 'get_quiz_attempt_summary'), {
      quiz_module_id: quiz.course_module_id,
      attempt_id: attemptId
    });
    assertAttemptSummary(restAttemptSummary, quiz, attemptId);

    const restAttemptSummaryView = await callRestFunction(toRestFunctionName(contract, 'view_quiz_attempt_summary'), {
      quiz_module_id: quiz.course_module_id,
      attempt_id: attemptId
    });
    assertAttemptView(restAttemptSummaryView, quiz, attemptId);

    const mcpAttemptAccess = await callMcpTool('get_quiz_attempt_access_information', {
      quiz_module_id: quiz.course_module_id,
      attempt_id: attemptId
    });
    assertAttemptAccess(mcpAttemptAccess, quiz, attemptId);

    const mcpAttemptData = await callMcpTool('get_quiz_attempt_data', {
      quiz_module_id: quiz.course_module_id,
      attempt_id: attemptId,
      page: 0
    });
    assertAttemptData(mcpAttemptData, quiz, attemptId);

    const mcpAttemptSummary = await callMcpTool('get_quiz_attempt_summary', {
      quiz_module_id: quiz.course_module_id,
      attempt_id: attemptId
    });
    assertAttemptSummary(mcpAttemptSummary, quiz, attemptId);

    const cliAttemptAccess = await callCli([
      'get-quiz-attempt-access-information',
      '--quiz-module-id', String(quiz.course_module_id),
      '--attempt-id', String(attemptId)
    ]);
    assertAttemptAccess(cliAttemptAccess, quiz, attemptId);

    const cliAttemptData = await callCli([
      'get-quiz-attempt-data',
      '--quiz-module-id', String(quiz.course_module_id),
      '--attempt-id', String(attemptId),
      '--page', '0'
    ]);
    assertAttemptData(cliAttemptData, quiz, attemptId);

    const cliAttemptView = await callCli([
      'view-quiz-attempt',
      '--quiz-module-id', String(quiz.course_module_id),
      '--attempt-id', String(attemptId),
      '--page', '0'
    ]);
    assertAttemptView(cliAttemptView, quiz, attemptId, 0);

    const cliAttemptSummary = await callCli([
      'get-quiz-attempt-summary',
      '--quiz-module-id', String(quiz.course_module_id),
      '--attempt-id', String(attemptId)
    ]);
    assertAttemptSummary(cliAttemptSummary, quiz, attemptId);

    const cliAttemptSummaryView = await callCli([
      'view-quiz-attempt-summary',
      '--quiz-module-id', String(quiz.course_module_id),
      '--attempt-id', String(attemptId)
    ]);
    assertAttemptView(cliAttemptSummaryView, quiz, attemptId);

    const restAttemptSave = await callRestFunction(toRestFunctionName(contract, 'save_quiz_attempt'), {
      quiz_module_id: quiz.course_module_id,
      attempt_id: attemptId,
      data: '[]'
    });
    assertAttemptSave(restAttemptSave, quiz, attemptId);

    const restAttemptProcess = await callRestFunction(toRestFunctionName(contract, 'process_quiz_attempt'), {
      quiz_module_id: quiz.course_module_id,
      attempt_id: attemptId,
      data: '[]',
      finish_attempt: true
    });
    assertAttemptProcess(restAttemptProcess, quiz, attemptId);

    const restAttemptReview = await callRestFunction(toRestFunctionName(contract, 'get_quiz_attempt_review'), {
      quiz_module_id: quiz.course_module_id,
      attempt_id: attemptId,
      page: -1
    });
    assertAttemptReview(restAttemptReview, quiz, attemptId);

    const restAttemptReviewView = await callRestFunction(toRestFunctionName(contract, 'view_quiz_attempt_review'), {
      quiz_module_id: quiz.course_module_id,
      attempt_id: attemptId
    });
    assertAttemptView(restAttemptReviewView, quiz, attemptId);

    const mcpReviewOfRestAttempt = await callMcpTool('get_quiz_attempt_review', {
      quiz_module_id: quiz.course_module_id,
      attempt_id: attemptId,
      page: -1
    });
    assertAttemptReview(mcpReviewOfRestAttempt, quiz, attemptId);

    const cliReviewOfRestAttempt = await callCli([
      'get-quiz-attempt-review',
      '--quiz-module-id', String(quiz.course_module_id),
      '--attempt-id', String(attemptId),
      '--page', '-1'
    ]);
    assertAttemptReview(cliReviewOfRestAttempt, quiz, attemptId);

    const startedMcpAttempt = await callRestFunction(toRestFunctionName(contract, 'start_quiz_attempt'), {
      quiz_module_id: quiz.course_module_id,
      force_new: true
    });
    const mcpAttemptId = startedMcpAttempt.attempt.attempt_id;
    assert.ok(mcpAttemptId > 0);

    const mcpAttemptSave = await callMcpTool('save_quiz_attempt', {
      quiz_module_id: quiz.course_module_id,
      attempt_id: mcpAttemptId,
      data: '[]'
    });
    assertAttemptSave(mcpAttemptSave, quiz, mcpAttemptId);

    const mcpAttemptProcess = await callMcpTool('process_quiz_attempt', {
      quiz_module_id: quiz.course_module_id,
      attempt_id: mcpAttemptId,
      data: '[]',
      finish_attempt: true
    });
    assertAttemptProcess(mcpAttemptProcess, quiz, mcpAttemptId);

    const mcpAttemptReviewView = await callMcpTool('view_quiz_attempt_review', {
      quiz_module_id: quiz.course_module_id,
      attempt_id: mcpAttemptId
    });
    assertAttemptView(mcpAttemptReviewView, quiz, mcpAttemptId);

    const startedCliAttempt = await callRestFunction(toRestFunctionName(contract, 'start_quiz_attempt'), {
      quiz_module_id: quiz.course_module_id,
      force_new: true
    });
    const cliProcessAttemptId = startedCliAttempt.attempt.attempt_id;
    assert.ok(cliProcessAttemptId > 0);

    const cliAttemptSave = await callCli([
      'save-quiz-attempt',
      '--quiz-module-id', String(quiz.course_module_id),
      '--attempt-id', String(cliProcessAttemptId),
      '--data', '[]'
    ]);
    assertAttemptSave(cliAttemptSave, quiz, cliProcessAttemptId);

    const cliAttemptProcess = await callCli([
      'process-quiz-attempt',
      '--quiz-module-id', String(quiz.course_module_id),
      '--attempt-id', String(cliProcessAttemptId),
      '--data', '[]',
      '--finish-attempt', 'true'
    ]);
    assertAttemptProcess(cliAttemptProcess, quiz, cliProcessAttemptId);

    const cliAttemptReviewView = await callCli([
      'view-quiz-attempt-review',
      '--quiz-module-id', String(quiz.course_module_id),
      '--attempt-id', String(cliProcessAttemptId)
    ]);
    assertAttemptView(cliAttemptReviewView, quiz, cliProcessAttemptId);

    const restBestGrade = await callRestFunction(toRestFunctionName(contract, 'get_quiz_user_best_grade'), {
      quiz_module_id: quiz.course_module_id
    });
    assert.equal(restBestGrade.quiz_module_id, quiz.course_module_id);
    assert.equal(typeof restBestGrade.has_grade, 'boolean');

    const mcpBestGrade = await callMcpTool('get_quiz_user_best_grade', {
      quiz_module_id: quiz.course_module_id
    });
    assert.equal(mcpBestGrade.quiz_module_id, quiz.course_module_id);
    assert.equal(typeof mcpBestGrade.grade, 'number');

    const cliBestGrade = await callCli([
      'get-quiz-user-best-grade',
      '--quiz-module-id', String(quiz.course_module_id)
    ]);
    assert.equal(cliBestGrade.quiz_module_id, quiz.course_module_id);
    assert.equal(typeof cliBestGrade.grade_to_pass, 'number');

    const restResultsReport = await callRestFunction(toRestFunctionName(contract, 'get_quiz_results_report'), {
      quiz_module_id: quiz.course_module_id,
      limit: 5,
      include_previews: true
    });
    assertQuizResultsReport(restResultsReport, quiz, 5);

    const mcpResultsReport = await callMcpTool('get_quiz_results_report', {
      quiz_module_id: quiz.course_module_id,
      limit: 5,
      include_previews: true
    });
    assertQuizResultsReport(mcpResultsReport, quiz, 5);

    const cliResultsReport = await callCli([
      'get-quiz-results-report',
      '--quiz-module-id', String(quiz.course_module_id),
      '--limit', '5',
      '--include-previews', 'true'
    ]);
    assertQuizResultsReport(cliResultsReport, quiz, 5);

    const restFeedback = await callRestFunction(toRestFunctionName(contract, 'get_quiz_feedback_for_grade'), {
      quiz_module_id: quiz.course_module_id,
      grade: 0
    });
    assert.equal(restFeedback.quiz_module_id, quiz.course_module_id);
    assert.equal(restFeedback.grade, 0);

    const mcpFeedback = await callMcpTool('get_quiz_feedback_for_grade', {
      quiz_module_id: quiz.course_module_id,
      grade: 5
    });
    assert.equal(mcpFeedback.quiz_module_id, quiz.course_module_id);
    assert.equal(mcpFeedback.grade, 5);

    const cliFeedback = await callCli([
      'get-quiz-feedback-for-grade',
      '--quiz-module-id', String(quiz.course_module_id),
      '--grade', '10'
    ]);
    assert.equal(cliFeedback.quiz_module_id, quiz.course_module_id);
    assert.equal(cliFeedback.grade, 10);

    const restQuestionTypes = await callRestFunction(toRestFunctionName(contract, 'get_quiz_required_question_types'), {
      quiz_module_id: quiz.course_module_id
    });
    assert.equal(restQuestionTypes.quiz_module_id, quiz.course_module_id);
    assert.ok(restQuestionTypes.question_types.includes('truefalse'));

    const mcpQuestionTypes = await callMcpTool('get_quiz_required_question_types', {
      quiz_module_id: quiz.course_module_id
    });
    assert.ok(mcpQuestionTypes.question_types.includes('truefalse'));

    const cliQuestionTypes = await callCli([
      'get-quiz-required-question-types',
      '--quiz-module-id', String(quiz.course_module_id)
    ]);
    assert.ok(cliQuestionTypes.question_types.includes('truefalse'));

    const deletedCourse = await callRestFunction(toRestFunctionName(contract, 'delete_course'), {
      course_id: courseId
    });
    assert.equal(deletedCourse.deleted, true);
    courseId = null;

    const deletedCategory = await callRestFunction(toRestFunctionName(contract, 'delete_course_category'), {
      category_id: categoryId
    });
    assert.equal(deletedCategory.deleted, true);
    categoryId = null;
  } finally {
    if (courseId !== null) {
      // The course is intentionally left behind on failure for manual Moodle inspection.
    } else if (categoryId !== null) {
      await callRestFunction(toRestFunctionName(contract, 'delete_course_category'), {
        category_id: categoryId
      });
    }
  }
});
