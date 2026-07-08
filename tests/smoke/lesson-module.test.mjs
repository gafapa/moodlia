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

function lessonOptions(suffix, overrides = {}) {
  const availableFrom = Math.floor(Date.now() / 1000) - 60;
  return {
    intro: `<p>MoodlIA lesson intro ${suffix}</p>`,
    practice: false,
    allow_review: true,
    ongoing_score: true,
    progress_bar: true,
    display_left_menu: true,
    display_left_if: 20,
    slideshow: false,
    max_answers: 4,
    default_feedback: true,
    available_from: availableFrom,
    deadline: availableFrom + 86400,
    time_limit_seconds: 0,
    use_password: false,
    allow_question_retry: true,
    max_attempts: 5,
    after_correct_answer: 'normal',
    pages_to_show: 0,
    grade: 100,
    custom_scoring: false,
    retakes_allowed: true,
    use_max_grade: false,
    minimum_questions: 0,
    activity_link: 0,
    allow_offline_attempts: false,
    completion_end_reached: true,
    completion_time_spent_seconds: 0,
    media_height: 100,
    media_width: 650,
    media_close_button: false,
    slideshow_width: 640,
    slideshow_height: 480,
    slideshow_background: '#FFFFFF',
    ...overrides
  };
}

function assertLessonDetails(details, created, expected) {
  const extra = JSON.parse(details.extra_json);

  assert.equal(details.module_type, 'lesson');
  assert.equal(details.course_module_id, created.course_module_id);
  assert.equal(extra.activity.lesson_id, created.instance_id);
  assert.equal(extra.activity.grade, expected.grade);
  assert.equal(extra.activity.max_answers, expected.max_answers);
  assert.equal(extra.activity.max_attempts, expected.max_attempts);
  assert.equal(extra.activity.progress_bar, expected.progress_bar);
  assert.equal(extra.activity.display_left_menu, expected.display_left_menu);
  assert.equal(extra.activity.default_feedback, expected.default_feedback);
  assert.equal(extra.activity.deadline > extra.activity.available_from, true);
  assert.equal(Object.hasOwn(extra.activity, 'password'), false);
}

function assertLessonAccess(access, created) {
  assert.equal(access.module_id, created.course_module_id);
  assert.equal(access.lesson_id, created.instance_id);
  assert.equal(typeof access.can_manage, 'boolean');
  assert.equal(typeof access.can_grade, 'boolean');
  assert.equal(typeof access.can_view_reports, 'boolean');
  assert.equal(typeof access.review_mode, 'boolean');
  assert.equal(typeof access.attempts_count, 'number');
  assert.equal(typeof access.first_page_id, 'number');
  assert.equal(Array.isArray(access.prevent_access_reasons), true);
  assert.equal(Array.isArray(access.warnings), true);
}

function assertLessonSummary(summary, created, expected) {
  assert.equal(summary.module_id, created.course_module_id);
  assert.equal(summary.lesson_id, created.instance_id);
  assert.equal(typeof summary.name, 'string');
  assert.equal(typeof summary.intro, 'string');
  assert.equal(summary.grade, expected.grade);
  assert.equal(summary.max_answers, expected.max_answers);
  assert.equal(summary.max_attempts, expected.max_attempts);
  assert.equal(summary.progress_bar, expected.progress_bar);
  assert.equal(summary.display_left_menu, expected.display_left_menu);
  assert.equal(summary.default_feedback, expected.default_feedback);
  assert.equal(typeof summary.use_password, 'boolean');
  assert.equal(typeof summary.allow_offline_attempts, 'boolean');
  assert.equal(Object.hasOwn(summary, 'password'), false);
}

function assertLessonApiDetails(details, created, expected) {
  assertLessonSummary(details.lesson, created, expected);
  assert.equal(Array.isArray(details.warnings), true);
}

function assertCourseLessons(courseLessons, courseId, expectedLessons) {
  assert.equal(courseLessons.course_id, courseId);
  assert.equal(courseLessons.count, courseLessons.lessons.length);
  assert.equal(Array.isArray(courseLessons.warnings), true);
  for (const expected of expectedLessons) {
    const found = courseLessons.lessons.find((lesson) => lesson.lesson_id === expected.created.instance_id);
    assert.ok(found, `Lesson ${expected.created.instance_id} should be returned in course listing`);
    assertLessonSummary(found, expected.created, expected.options);
  }
}

function assertLessonPages(pages, created) {
  assert.equal(pages.module_id, created.course_module_id);
  assert.equal(pages.lesson_id, created.instance_id);
  assert.equal(pages.count, pages.pages.length);
  assert.equal(Array.isArray(pages.warnings), true);
  for (const page of pages.pages) {
    assert.equal(page.module_id, created.course_module_id);
    assert.equal(page.lesson_id, created.instance_id);
    assert.equal(Array.isArray(page.answer_ids), true);
    assert.equal(Array.isArray(page.jumps), true);
  }
}

function assertLessonContentPage(result, created, expectedTitle, expectedContent, expectedBranchTitle) {
  assert.equal(result.page.module_id, created.course_module_id);
  assert.equal(result.page.lesson_id, created.instance_id);
  assert.equal(typeof result.page.page_id, 'number');
  assert.equal(result.page.question_type, 20);
  assert.equal(result.page.title, expectedTitle);
  assert.match(result.page.content, new RegExp(expectedContent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.equal(result.page.branches_count, result.page.branches.length);
  assert.ok(result.page.branches.some((branch) => branch.title === expectedBranchTitle));
  assert.equal(Array.isArray(result.page.answer_ids), true);
  assert.equal(Array.isArray(result.page.jumps), true);
}

function assertLessonTrueFalsePage(result, created, expectedTitle, expectedContent, expectedCorrectAnswer, expectedWrongAnswer) {
  assert.equal(result.page.module_id, created.course_module_id);
  assert.equal(result.page.lesson_id, created.instance_id);
  assert.equal(typeof result.page.page_id, 'number');
  assert.equal(result.page.question_type, 2);
  assert.equal(result.page.title, expectedTitle);
  assert.match(result.page.content, new RegExp(expectedContent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.equal(result.page.branches_count, 2);
  assert.equal(result.page.branches.length, 2);
  assert.ok(result.page.branches.some((answer) => answer.title === expectedCorrectAnswer && answer.score >= 0));
  assert.ok(result.page.branches.some((answer) => answer.title === expectedWrongAnswer));
  assert.equal(Array.isArray(result.page.answer_ids), true);
  assert.equal(result.page.answer_ids.length, 2);
  assert.equal(Array.isArray(result.page.jumps), true);
  assert.equal(result.page.jumps.length, 2);
}

function assertLessonMultichoicePage(result, created, expectedTitle, expectedContent, expectedAnswers, expectedMultiAnswer = false) {
  assert.equal(result.page.module_id, created.course_module_id);
  assert.equal(result.page.lesson_id, created.instance_id);
  assert.equal(typeof result.page.page_id, 'number');
  assert.equal(result.page.question_type, 3);
  assert.equal(result.page.question_option, expectedMultiAnswer ? 1 : 0);
  assert.equal(result.page.title, expectedTitle);
  assert.match(result.page.content, new RegExp(expectedContent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.equal(result.page.branches_count, expectedAnswers.length);
  assert.equal(result.page.branches.length, expectedAnswers.length);
  for (const expectedAnswer of expectedAnswers) {
    assert.ok(result.page.branches.some((answer) => answer.title === expectedAnswer));
  }
  assert.equal(Array.isArray(result.page.answer_ids), true);
  assert.equal(result.page.answer_ids.length, expectedAnswers.length);
  assert.equal(Array.isArray(result.page.jumps), true);
  assert.equal(result.page.jumps.length, expectedAnswers.length);
}

function assertLessonPossibleJumps(jumps, created) {
  assert.equal(jumps.module_id, created.course_module_id);
  assert.equal(jumps.lesson_id, created.instance_id);
  assert.equal(jumps.count, jumps.jumps.length);
  assert.equal(Array.isArray(jumps.warnings), true);
  for (const jump of jumps.jumps) {
    assert.equal(typeof jump.page_id, 'number');
    assert.equal(typeof jump.answer_id, 'number');
    assert.equal(typeof jump.jump_to, 'number');
    assert.equal(typeof jump.calculated_jump, 'number');
  }
}

function assertLessonView(view, created) {
  assert.equal(view.module_id, created.course_module_id);
  assert.equal(view.lesson_id, created.instance_id);
  assert.equal(view.viewed, true);
  assert.equal(Array.isArray(view.warnings), true);
}

function assertLessonUserGrade(grade, created) {
  assert.equal(grade.module_id, created.course_module_id);
  assert.equal(grade.lesson_id, created.instance_id);
  assert.equal(typeof grade.has_grade, 'boolean');
  assert.equal(typeof grade.grade, 'number');
  assert.equal(typeof grade.formatted_grade, 'string');
  assert.equal(Array.isArray(grade.warnings), true);
}

function assertLessonUserTimers(timers, created) {
  assert.equal(timers.module_id, created.course_module_id);
  assert.equal(timers.lesson_id, created.instance_id);
  assert.equal(timers.count, timers.timers.length);
  assert.equal(Array.isArray(timers.warnings), true);
  for (const timer of timers.timers) {
    assert.equal(timer.module_id, created.course_module_id);
    assert.equal(timer.lesson_id, created.instance_id);
    assert.equal(typeof timer.completed, 'boolean');
  }
}

function assertLessonAttemptsOverview(overview, created) {
  assert.equal(overview.module_id, created.course_module_id);
  assert.equal(overview.lesson_id, created.instance_id);
  assert.equal(typeof overview.lesson_scored, 'boolean');
  assert.equal(typeof overview.attempts_count, 'number');
  assert.equal(Array.isArray(overview.students), true);
  assert.equal(Array.isArray(overview.warnings), true);
  for (const student of overview.students) {
    assert.equal(Array.isArray(student.attempts), true);
  }
}

test('Lesson module lifecycle works through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const categoryName = `MoodlIA Lesson Category ${suffix}`;
  const courseName = `MoodlIA Lesson Course ${suffix}`;
  const courseShortname = `moodlia-lesson-${suffix}`;
  const sectionName = `MoodlIA Lesson Section ${suffix}`;
  let categoryId = null;
  let courseId = null;
  let sectionDeleted = false;
  let restLessonDeleted = false;
  let mcpLessonDeleted = false;
  let cliLessonDeleted = false;
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
      summary: `<p>MoodlIA lesson smoke course ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });
    courseId = course.course_id;

    const section = await callRestFunction(toRestFunctionName(contract, 'create_section'), {
      course_id: courseId,
      name: sectionName
    });

    const restOptions = lessonOptions(suffix);
    const restLesson = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'lesson',
      name: `MoodlIA REST Lesson ${suffix}`,
      options: JSON.stringify(restOptions)
    });
    assert.equal(restLesson.module_type, 'lesson');
    assert.match(restLesson.url, /\/mod\/lesson\/view\.php\?id=/);

    const restDetails = await callRestFunction(toRestFunctionName(contract, 'get_module_details'), {
      course_id: courseId,
      module_id: restLesson.course_module_id
    });
    assertLessonDetails(restDetails, restLesson, restOptions);

    const restAccess = await callRestFunction(toRestFunctionName(contract, 'get_lesson_access_information'), {
      course_id: courseId,
      module_id: restLesson.course_module_id
    });
    assertLessonAccess(restAccess, restLesson);

    const restLessonDetails = await callRestFunction(toRestFunctionName(contract, 'get_lesson_details'), {
      course_id: courseId,
      module_id: restLesson.course_module_id
    });
    assertLessonApiDetails(restLessonDetails, restLesson, restOptions);

    const restCourseLessons = await callRestFunction(toRestFunctionName(contract, 'get_course_lessons'), {
      course_id: courseId
    });
    assertCourseLessons(restCourseLessons, courseId, [{ created: restLesson, options: restOptions }]);

    const restPages = await callRestFunction(toRestFunctionName(contract, 'get_lesson_pages'), {
      course_id: courseId,
      module_id: restLesson.course_module_id
    });
    assertLessonPages(restPages, restLesson);

    const restPage = await callRestFunction(toRestFunctionName(contract, 'create_lesson_page'), {
      course_id: courseId,
      module_id: restLesson.course_module_id,
      title: `REST Lesson Page ${suffix}`,
      content: `<p>REST lesson page content ${suffix}</p>`,
      branches: JSON.stringify({ branches: [{ title: 'Continue', jump_to: 'next_page' }] })
    });
    assert.equal(restPage.created, true);
    assertLessonContentPage(restPage, restLesson, `REST Lesson Page ${suffix}`, `REST lesson page content ${suffix}`, 'Continue');

    const restPagesAfterCreate = await callRestFunction(toRestFunctionName(contract, 'get_lesson_pages'), {
      course_id: courseId,
      module_id: restLesson.course_module_id
    });
    assert.ok(restPagesAfterCreate.pages.some((page) => page.page_id === restPage.page.page_id));

    const updatedRestPage = await callRestFunction(toRestFunctionName(contract, 'update_lesson_page'), {
      course_id: courseId,
      module_id: restLesson.course_module_id,
      page_id: restPage.page.page_id,
      title: `Updated REST Lesson Page ${suffix}`,
      content: `<p>Updated REST lesson page content ${suffix}</p>`,
      branches: JSON.stringify({ branches: [{ title: 'Finish', jump_to: 'end_of_lesson' }] })
    });
    assert.equal(updatedRestPage.updated, true);
    assertLessonContentPage(
      updatedRestPage,
      restLesson,
      `Updated REST Lesson Page ${suffix}`,
      `Updated REST lesson page content ${suffix}`,
      'Finish'
    );

    const restTrueFalsePage = await callRestFunction(toRestFunctionName(contract, 'create_lesson_page'), {
      course_id: courseId,
      module_id: restLesson.course_module_id,
      page_type: 'truefalse',
      title: `REST TrueFalse Lesson Page ${suffix}`,
      content: `<p>REST truefalse lesson page content ${suffix}</p>`,
      answers: JSON.stringify({
        correct: { answer: 'True', response: 'Correct', jump_to: 'next_page', score: 1 },
        wrong: { answer: 'False', response: 'Try again', jump_to: 'this_page', score: 0 }
      })
    });
    assert.equal(restTrueFalsePage.created, true);
    assertLessonTrueFalsePage(
      restTrueFalsePage,
      restLesson,
      `REST TrueFalse Lesson Page ${suffix}`,
      `REST truefalse lesson page content ${suffix}`,
      'True',
      'False'
    );

    const updatedRestTrueFalsePage = await callRestFunction(toRestFunctionName(contract, 'update_lesson_page'), {
      course_id: courseId,
      module_id: restLesson.course_module_id,
      page_id: restTrueFalsePage.page.page_id,
      title: `Updated REST TrueFalse Lesson Page ${suffix}`,
      answers: JSON.stringify({
        answers: [
          { answer: 'Correct option', response: 'Correct', jump_to: 'next_page', score: 1 },
          { answer: 'Wrong option', response: 'Review the page', jump_to: 'this_page', score: 0 }
        ]
      })
    });
    assert.equal(updatedRestTrueFalsePage.updated, true);
    assertLessonTrueFalsePage(
      updatedRestTrueFalsePage,
      restLesson,
      `Updated REST TrueFalse Lesson Page ${suffix}`,
      `REST truefalse lesson page content ${suffix}`,
      'Correct option',
      'Wrong option'
    );

    const deletedRestTrueFalsePage = await callRestFunction(toRestFunctionName(contract, 'delete_lesson_page'), {
      course_id: courseId,
      module_id: restLesson.course_module_id,
      page_id: restTrueFalsePage.page.page_id
    });
    assert.equal(deletedRestTrueFalsePage.deleted, true);

    const restMultichoicePage = await callRestFunction(toRestFunctionName(contract, 'create_lesson_page'), {
      course_id: courseId,
      module_id: restLesson.course_module_id,
      page_type: 'multichoice',
      title: `REST Multichoice Lesson Page ${suffix}`,
      content: `<p>REST multichoice lesson page content ${suffix}</p>`,
      answers: JSON.stringify({
        multi_answer: false,
        answers: [
          { answer: 'Best option', response: 'Correct', jump_to: 'next_page', score: 1 },
          { answer: 'Distractor', response: 'Review the content', jump_to: 'this_page', score: 0 },
          { answer: 'Another distractor', response: 'Try again', jump_to: 'this_page', score: 0 }
        ]
      })
    });
    assert.equal(restMultichoicePage.created, true);
    assertLessonMultichoicePage(
      restMultichoicePage,
      restLesson,
      `REST Multichoice Lesson Page ${suffix}`,
      `REST multichoice lesson page content ${suffix}`,
      ['Best option', 'Distractor', 'Another distractor']
    );

    const updatedRestMultichoicePage = await callRestFunction(toRestFunctionName(contract, 'update_lesson_page'), {
      course_id: courseId,
      module_id: restLesson.course_module_id,
      page_id: restMultichoicePage.page.page_id,
      title: `Updated REST Multichoice Lesson Page ${suffix}`,
      answers: JSON.stringify({
        multi_answer: true,
        answers: [
          { answer: 'First valid option', response: 'Correct', jump_to: 'next_page', score: 1 },
          { answer: 'Second valid option', response: 'Correct', jump_to: 'next_page', score: 1 },
          { answer: 'Invalid option', response: 'Review the content', jump_to: 'this_page', score: 0 }
        ]
      })
    });
    assert.equal(updatedRestMultichoicePage.updated, true);
    assertLessonMultichoicePage(
      updatedRestMultichoicePage,
      restLesson,
      `Updated REST Multichoice Lesson Page ${suffix}`,
      `REST multichoice lesson page content ${suffix}`,
      ['First valid option', 'Second valid option', 'Invalid option'],
      true
    );

    const deletedRestMultichoicePage = await callRestFunction(toRestFunctionName(contract, 'delete_lesson_page'), {
      course_id: courseId,
      module_id: restLesson.course_module_id,
      page_id: restMultichoicePage.page.page_id
    });
    assert.equal(deletedRestMultichoicePage.deleted, true);

    const deletedRestPage = await callRestFunction(toRestFunctionName(contract, 'delete_lesson_page'), {
      course_id: courseId,
      module_id: restLesson.course_module_id,
      page_id: restPage.page.page_id
    });
    assert.equal(deletedRestPage.deleted, true);

    const restJumps = await callRestFunction(toRestFunctionName(contract, 'get_lesson_possible_jumps'), {
      course_id: courseId,
      module_id: restLesson.course_module_id
    });
    assertLessonPossibleJumps(restJumps, restLesson);

    const restView = await callRestFunction(toRestFunctionName(contract, 'view_lesson'), {
      course_id: courseId,
      module_id: restLesson.course_module_id
    });
    assertLessonView(restView, restLesson);

    const restGrade = await callRestFunction(toRestFunctionName(contract, 'get_lesson_user_grade'), {
      course_id: courseId,
      module_id: restLesson.course_module_id
    });
    assertLessonUserGrade(restGrade, restLesson);

    const restTimers = await callRestFunction(toRestFunctionName(contract, 'get_lesson_user_timers'), {
      course_id: courseId,
      module_id: restLesson.course_module_id
    });
    assertLessonUserTimers(restTimers, restLesson);

    const restOverview = await callRestFunction(toRestFunctionName(contract, 'get_lesson_attempts_overview'), {
      course_id: courseId,
      module_id: restLesson.course_module_id
    });
    assertLessonAttemptsOverview(restOverview, restLesson);

    const mcpOptions = lessonOptions(suffix, { progress_bar: false, max_attempts: 3, grade: 80 });
    const mcpLesson = await callMcpTool('create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'lesson',
      name: `MoodlIA MCP Lesson ${suffix}`,
      options: mcpOptions
    });
    assert.equal(mcpLesson.module_type, 'lesson');

    const mcpDetails = await callMcpTool('get_module_details', {
      course_id: courseId,
      module_id: mcpLesson.course_module_id
    });
    assertLessonDetails(mcpDetails, mcpLesson, mcpOptions);

    const mcpAccess = await callMcpTool('get_lesson_access_information', {
      course_id: courseId,
      module_id: mcpLesson.course_module_id
    });
    assertLessonAccess(mcpAccess, mcpLesson);

    const mcpLessonDetails = await callMcpTool('get_lesson_details', {
      course_id: courseId,
      module_id: mcpLesson.course_module_id
    });
    assertLessonApiDetails(mcpLessonDetails, mcpLesson, mcpOptions);

    const mcpCourseLessons = await callMcpTool('get_course_lessons', {
      course_id: courseId
    });
    assertCourseLessons(mcpCourseLessons, courseId, [
      { created: restLesson, options: restOptions },
      { created: mcpLesson, options: mcpOptions }
    ]);

    const mcpPages = await callMcpTool('get_lesson_pages', {
      course_id: courseId,
      module_id: mcpLesson.course_module_id
    });
    assertLessonPages(mcpPages, mcpLesson);

    const mcpPage = await callMcpTool('create_lesson_page', {
      course_id: courseId,
      module_id: mcpLesson.course_module_id,
      title: `MCP Lesson Page ${suffix}`,
      content: `<p>MCP lesson page content ${suffix}</p>`,
      branches: { branches: [{ title: 'Continue', jump_to: 'next_page' }] }
    });
    assert.equal(mcpPage.created, true);
    assertLessonContentPage(mcpPage, mcpLesson, `MCP Lesson Page ${suffix}`, `MCP lesson page content ${suffix}`, 'Continue');

    const updatedMcpPage = await callMcpTool('update_lesson_page', {
      course_id: courseId,
      module_id: mcpLesson.course_module_id,
      page_id: mcpPage.page.page_id,
      title: `Updated MCP Lesson Page ${suffix}`,
      branches: { branches: [{ title: 'Finish', jump_to: 'end_of_lesson' }] }
    });
    assert.equal(updatedMcpPage.updated, true);
    assertLessonContentPage(updatedMcpPage, mcpLesson, `Updated MCP Lesson Page ${suffix}`, `MCP lesson page content ${suffix}`, 'Finish');

    const mcpTrueFalsePage = await callMcpTool('create_lesson_page', {
      course_id: courseId,
      module_id: mcpLesson.course_module_id,
      page_type: 'truefalse',
      title: `MCP TrueFalse Lesson Page ${suffix}`,
      content: `<p>MCP truefalse lesson page content ${suffix}</p>`,
      answers: {
        correct: { answer: 'True', response: 'Correct', jump_to: 'next_page', score: 1 },
        wrong: { answer: 'False', response: 'Try again', jump_to: 'this_page', score: 0 }
      }
    });
    assert.equal(mcpTrueFalsePage.created, true);
    assertLessonTrueFalsePage(
      mcpTrueFalsePage,
      mcpLesson,
      `MCP TrueFalse Lesson Page ${suffix}`,
      `MCP truefalse lesson page content ${suffix}`,
      'True',
      'False'
    );

    const updatedMcpTrueFalsePage = await callMcpTool('update_lesson_page', {
      course_id: courseId,
      module_id: mcpLesson.course_module_id,
      page_id: mcpTrueFalsePage.page.page_id,
      answers: {
        answers: [
          { answer: 'Correct option', response: 'Correct', jump_to: 'next_page', score: 1 },
          { answer: 'Wrong option', response: 'Review the page', jump_to: 'this_page', score: 0 }
        ]
      }
    });
    assert.equal(updatedMcpTrueFalsePage.updated, true);
    assertLessonTrueFalsePage(
      updatedMcpTrueFalsePage,
      mcpLesson,
      `MCP TrueFalse Lesson Page ${suffix}`,
      `MCP truefalse lesson page content ${suffix}`,
      'Correct option',
      'Wrong option'
    );

    const deletedMcpTrueFalsePage = await callMcpTool('delete_lesson_page', {
      course_id: courseId,
      module_id: mcpLesson.course_module_id,
      page_id: mcpTrueFalsePage.page.page_id
    });
    assert.equal(deletedMcpTrueFalsePage.deleted, true);

    const deletedMcpPage = await callMcpTool('delete_lesson_page', {
      course_id: courseId,
      module_id: mcpLesson.course_module_id,
      page_id: mcpPage.page.page_id
    });
    assert.equal(deletedMcpPage.deleted, true);

    const mcpJumps = await callMcpTool('get_lesson_possible_jumps', {
      course_id: courseId,
      module_id: mcpLesson.course_module_id
    });
    assertLessonPossibleJumps(mcpJumps, mcpLesson);

    const mcpView = await callMcpTool('view_lesson', {
      course_id: courseId,
      module_id: mcpLesson.course_module_id
    });
    assertLessonView(mcpView, mcpLesson);

    const mcpGrade = await callMcpTool('get_lesson_user_grade', {
      course_id: courseId,
      module_id: mcpLesson.course_module_id
    });
    assertLessonUserGrade(mcpGrade, mcpLesson);

    const mcpTimers = await callMcpTool('get_lesson_user_timers', {
      course_id: courseId,
      module_id: mcpLesson.course_module_id
    });
    assertLessonUserTimers(mcpTimers, mcpLesson);

    const mcpOverview = await callMcpTool('get_lesson_attempts_overview', {
      course_id: courseId,
      module_id: mcpLesson.course_module_id
    });
    assertLessonAttemptsOverview(mcpOverview, mcpLesson);

    const cliOptions = lessonOptions(suffix, { display_left_menu: false, default_feedback: false, max_answers: 5 });
    const cliLesson = await callCli([
      'create-module',
      '--course-id', String(courseId),
      '--section-number', String(section.section_number),
      '--module-type', 'lesson',
      '--name', `MoodlIA CLI Lesson ${suffix}`,
      '--options', JSON.stringify(cliOptions)
    ]);
    assert.equal(cliLesson.module_type, 'lesson');

    const cliDetails = await callCli([
      'get-module-details',
      '--course-id', String(courseId),
      '--module-id', String(cliLesson.course_module_id)
    ]);
    assertLessonDetails(cliDetails, cliLesson, cliOptions);

    const cliAccess = await callCli([
      'get-lesson-access-information',
      '--course-id', String(courseId),
      '--module-id', String(cliLesson.course_module_id)
    ]);
    assertLessonAccess(cliAccess, cliLesson);

    const cliLessonDetails = await callCli([
      'get-lesson-details',
      '--course-id', String(courseId),
      '--module-id', String(cliLesson.course_module_id)
    ]);
    assertLessonApiDetails(cliLessonDetails, cliLesson, cliOptions);

    const cliCourseLessons = await callCli([
      'get-course-lessons',
      '--course-id', String(courseId)
    ]);
    assertCourseLessons(cliCourseLessons, courseId, [
      { created: restLesson, options: restOptions },
      { created: mcpLesson, options: mcpOptions },
      { created: cliLesson, options: cliOptions }
    ]);

    const cliPages = await callCli([
      'get-lesson-pages',
      '--course-id', String(courseId),
      '--module-id', String(cliLesson.course_module_id)
    ]);
    assertLessonPages(cliPages, cliLesson);

    const cliPage = await callCli([
      'create-lesson-page',
      '--course-id', String(courseId),
      '--module-id', String(cliLesson.course_module_id),
      '--title', `CLI Lesson Page ${suffix}`,
      '--content', `<p>CLI lesson page content ${suffix}</p>`,
      '--branches', JSON.stringify({ branches: [{ title: 'Continue', jump_to: 'next_page' }] })
    ]);
    assert.equal(cliPage.created, true);
    assertLessonContentPage(cliPage, cliLesson, `CLI Lesson Page ${suffix}`, `CLI lesson page content ${suffix}`, 'Continue');

    const updatedCliPage = await callCli([
      'update-lesson-page',
      '--course-id', String(courseId),
      '--module-id', String(cliLesson.course_module_id),
      '--page-id', String(cliPage.page.page_id),
      '--title', `Updated CLI Lesson Page ${suffix}`,
      '--branches', JSON.stringify({ branches: [{ title: 'Finish', jump_to: 'end_of_lesson' }] })
    ]);
    assert.equal(updatedCliPage.updated, true);
    assertLessonContentPage(updatedCliPage, cliLesson, `Updated CLI Lesson Page ${suffix}`, `CLI lesson page content ${suffix}`, 'Finish');

    const cliTrueFalsePage = await callCli([
      'create-lesson-page',
      '--course-id', String(courseId),
      '--module-id', String(cliLesson.course_module_id),
      '--page-type', 'truefalse',
      '--title', `CLI TrueFalse Lesson Page ${suffix}`,
      '--content', `<p>CLI truefalse lesson page content ${suffix}</p>`,
      '--answers', JSON.stringify({
        correct: { answer: 'True', response: 'Correct', jump_to: 'next_page', score: 1 },
        wrong: { answer: 'False', response: 'Try again', jump_to: 'this_page', score: 0 }
      })
    ]);
    assert.equal(cliTrueFalsePage.created, true);
    assertLessonTrueFalsePage(
      cliTrueFalsePage,
      cliLesson,
      `CLI TrueFalse Lesson Page ${suffix}`,
      `CLI truefalse lesson page content ${suffix}`,
      'True',
      'False'
    );

    const updatedCliTrueFalsePage = await callCli([
      'update-lesson-page',
      '--course-id', String(courseId),
      '--module-id', String(cliLesson.course_module_id),
      '--page-id', String(cliTrueFalsePage.page.page_id),
      '--answers', JSON.stringify({
        answers: [
          { answer: 'Correct option', response: 'Correct', jump_to: 'next_page', score: 1 },
          { answer: 'Wrong option', response: 'Review the page', jump_to: 'this_page', score: 0 }
        ]
      })
    ]);
    assert.equal(updatedCliTrueFalsePage.updated, true);
    assertLessonTrueFalsePage(
      updatedCliTrueFalsePage,
      cliLesson,
      `CLI TrueFalse Lesson Page ${suffix}`,
      `CLI truefalse lesson page content ${suffix}`,
      'Correct option',
      'Wrong option'
    );

    const deletedCliTrueFalsePage = await callCli([
      'delete-lesson-page',
      '--course-id', String(courseId),
      '--module-id', String(cliLesson.course_module_id),
      '--page-id', String(cliTrueFalsePage.page.page_id)
    ]);
    assert.equal(deletedCliTrueFalsePage.deleted, true);

    const deletedCliPage = await callCli([
      'delete-lesson-page',
      '--course-id', String(courseId),
      '--module-id', String(cliLesson.course_module_id),
      '--page-id', String(cliPage.page.page_id)
    ]);
    assert.equal(deletedCliPage.deleted, true);

    const cliJumps = await callCli([
      'get-lesson-possible-jumps',
      '--course-id', String(courseId),
      '--module-id', String(cliLesson.course_module_id)
    ]);
    assertLessonPossibleJumps(cliJumps, cliLesson);

    const cliView = await callCli([
      'view-lesson',
      '--course-id', String(courseId),
      '--module-id', String(cliLesson.course_module_id)
    ]);
    assertLessonView(cliView, cliLesson);

    const cliGrade = await callCli([
      'get-lesson-user-grade',
      '--course-id', String(courseId),
      '--module-id', String(cliLesson.course_module_id)
    ]);
    assertLessonUserGrade(cliGrade, cliLesson);

    const cliTimers = await callCli([
      'get-lesson-user-timers',
      '--course-id', String(courseId),
      '--module-id', String(cliLesson.course_module_id)
    ]);
    assertLessonUserTimers(cliTimers, cliLesson);

    const cliOverview = await callCli([
      'get-lesson-attempts-overview',
      '--course-id', String(courseId),
      '--module-id', String(cliLesson.course_module_id)
    ]);
    assertLessonAttemptsOverview(cliOverview, cliLesson);

    const deletedCliLesson = await callCli([
      'delete-module',
      '--course-id', String(courseId),
      '--module-id', String(cliLesson.course_module_id)
    ]);
    assert.equal(deletedCliLesson.deleted, true);
    cliLessonDeleted = true;

    const deletedMcpLesson = await callMcpTool('delete_module', {
      course_id: courseId,
      module_id: mcpLesson.course_module_id
    });
    assert.equal(deletedMcpLesson.deleted, true);
    mcpLessonDeleted = true;

    const deletedRestLesson = await callRestFunction(toRestFunctionName(contract, 'delete_module'), {
      course_id: courseId,
      module_id: restLesson.course_module_id
    });
    assert.equal(deletedRestLesson.deleted, true);
    restLessonDeleted = true;

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
      console.error(`Generated lesson course left in Moodle for inspection: ${courseId}`);
      if (!restLessonDeleted) {
        console.error('REST lesson cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!mcpLessonDeleted) {
        console.error('MCP lesson cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!cliLessonDeleted) {
        console.error('CLI lesson cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!sectionDeleted) {
        console.error('Lesson section cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
    }
    if (categoryId && !categoryDeleted) {
      console.error(`Generated lesson course category left in Moodle for inspection: ${categoryId}`);
    }
    throw error;
  }
});
