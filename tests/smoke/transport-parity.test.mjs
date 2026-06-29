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
const hasTransportConfig = requireEnv(['MOODLE_BASE_URL', 'MOODLE_REST_TOKEN']);

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

function normalizeUser(user) {
  return {
    id: Number(user.id),
    username: String(user.username ?? ''),
    fullname: String(user.fullname ?? ''),
    site_url: String(user.site_url ?? '')
  };
}

function normalizeCourses(payload) {
  const courses = Array.isArray(payload) ? payload : payload?.courses;
  assert.ok(Array.isArray(courses), 'course payload must expose a course array');

  return courses.map((course) => ({
    course_id: Number(course.course_id ?? course.id),
    shortname: String(course.shortname ?? ''),
    fullname: String(course.fullname ?? course.name ?? ''),
    visible: Boolean(course.visible)
  }));
}

function normalizeGroup(group) {
  return {
    course_id: Number(group.course_id),
    name: String(group.name),
    description: String(group.description ?? ''),
    idnumber: String(group.idnumber ?? '')
  };
}

function normalizeModule(module) {
  return {
    section_number: Number(module.section_number),
    module_type: String(module.module_type),
    name: String(module.name),
    visible: Boolean(module.visible)
  };
}

function normalizeDataField(field) {
  return {
    module_id: Number(field.module_id),
    type: String(field.type),
    name: String(field.name),
    required: Boolean(field.required)
  };
}

function normalizeDataEntry(entry) {
  return {
    module_id: Number(entry.module_id),
    contents_json: String(entry.contents_json ?? '')
  };
}

function normalizeQuizSlot(slot) {
  return {
    quiz_module_id: Number(slot.quiz_module_id ?? 0),
    question_id: Number(slot.question_id),
    slot: Number(slot.slot),
    maxmark: Number(slot.maxmark)
  };
}

test('REST, MCP, and CLI return the same current-user shape', { skip: !hasTransportConfig }, async () => {
  const contract = await loadContract();

  const restUser = normalizeUser(await callRestFunction(toRestFunctionName(contract, 'get_current_user')));
  const mcpUser = normalizeUser(await callMcpTool('get_current_user'));
  const cliUser = normalizeUser(await callCli(['get-current-user']));

  assert.deepEqual(mcpUser, restUser, 'MCP current-user shape must match REST');
  assert.deepEqual(cliUser, restUser, 'CLI current-user shape must match REST');
});

test('REST, MCP, and CLI return compatible limited course lists', { skip: !hasTransportConfig }, async () => {
  const contract = await loadContract();
  const limit = 3;

  const restCourses = normalizeCourses(await callRestFunction(toRestFunctionName(contract, 'get_courses'), { limit }));
  const mcpCourses = normalizeCourses(await callMcpTool('get_courses', { limit }));
  const cliCourses = normalizeCourses(await callCli(['get-courses', '--limit', String(limit)]));

  assert.ok(restCourses.length <= limit, 'REST get_courses must respect the limit parameter');
  assert.deepEqual(mcpCourses, restCourses, 'MCP limited course list must match REST');
  assert.deepEqual(cliCourses, restCourses, 'CLI limited course list must match REST');
});

test('REST, MCP, and CLI expose equivalent create/list effects for complex course subelements', {
  skip: !hasTransportConfig
}, async () => {
  const contract = await loadContract();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let categoryId = null;
  let courseId = null;
  let cleanupAllowed = false;

  try {
    const category = await callRestFunction(toRestFunctionName(contract, 'create_course_category'), {
      name: `MoodlIA Transport Parity Category ${suffix}`,
      visible: 1
    });
    categoryId = category.category_id;

    const course = await callRestFunction(toRestFunctionName(contract, 'create_course'), {
      fullname: `MoodlIA Transport Parity Course ${suffix}`,
      shortname: `moodlia-transport-parity-${suffix}`,
      category_id: categoryId,
      visible: 1,
      summary: `<p>MoodlIA transport parity course ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });
    courseId = course.course_id;

    const section = await callRestFunction(toRestFunctionName(contract, 'create_section'), {
      course_id: courseId,
      name: `MoodlIA Transport Parity Section ${suffix}`
    });

    const restGroup = await callRestFunction(toRestFunctionName(contract, 'create_group'), {
      course_id: courseId,
      name: `MoodlIA REST Parity Group ${suffix}`,
      description: 'Created through REST.'
    });
    const mcpGroup = await callMcpTool('create_group', {
      course_id: courseId,
      name: `MoodlIA MCP Parity Group ${suffix}`,
      description: 'Created through MCP.'
    });
    const cliGroup = await callCli([
      'create-group',
      '--course-id', String(courseId),
      '--name', `MoodlIA CLI Parity Group ${suffix}`,
      '--description', 'Created through CLI.'
    ]);

    for (const group of [restGroup, mcpGroup, cliGroup]) {
      assert.equal(group.course_id, courseId);
      assert.ok(group.group_id > 0);
      assert.deepEqual(Object.keys(normalizeGroup(group)).sort(), ['course_id', 'description', 'idnumber', 'name']);
    }

    const listedGroups = await callRestFunction(toRestFunctionName(contract, 'get_groups'), {
      course_id: courseId
    });
    for (const group of [restGroup, mcpGroup, cliGroup]) {
      assert.ok(
        listedGroups.groups.some((listed) => listed.group_id === group.group_id && listed.name === group.name),
        `${group.name} must be visible through REST get_groups after creation`
      );
    }

    const pageOptions = (transport) => ({
      content: `<p>MoodlIA ${transport} parity page ${suffix}</p>`,
      visible: true,
      show_description: true
    });
    const restPage = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'page',
      name: `MoodlIA REST Parity Page ${suffix}`,
      options: JSON.stringify(pageOptions('REST'))
    });
    const mcpPage = await callMcpTool('create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'page',
      name: `MoodlIA MCP Parity Page ${suffix}`,
      options: pageOptions('MCP')
    });
    const cliPage = await callCli([
      'create-module',
      '--course-id', String(courseId),
      '--section-number', String(section.section_number),
      '--module-type', 'page',
      '--name', `MoodlIA CLI Parity Page ${suffix}`,
      '--options', JSON.stringify(pageOptions('CLI'))
    ]);

    for (const module of [restPage, mcpPage, cliPage]) {
      assert.ok(module.course_module_id > 0);
      assert.equal(module.module_type, 'page');
      assert.deepEqual(
        Object.keys(normalizeModule(module)).sort(),
        ['module_type', 'name', 'section_number', 'visible']
      );
    }

    const contentsAfterPages = await callRestFunction(toRestFunctionName(contract, 'get_course_contents'), {
      course_id: courseId
    });
    const pageModuleIds = new Set([restPage.course_module_id, mcpPage.course_module_id, cliPage.course_module_id]);
    const listedPageModuleIds = new Set(contentsAfterPages.sections.flatMap((item) =>
      item.modules.map((module) => module.course_module_id)
    ));
    for (const moduleId of pageModuleIds) {
      assert.ok(listedPageModuleIds.has(moduleId), `Page module ${moduleId} must be visible in course contents`);
    }

    const database = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'data',
      name: `MoodlIA Parity Database ${suffix}`,
      options: JSON.stringify({
        intro: `<p>MoodlIA parity database ${suffix}</p>`,
        approval_required: false,
        manage_approved: false,
        required_entries: 0,
        required_entries_to_view: 0,
        max_entries: 0,
        edit_any: true
      })
    });

    const restField = await callRestFunction(toRestFunctionName(contract, 'create_data_field'), {
      course_id: courseId,
      module_id: database.course_module_id,
      field_type: 'text',
      name: `REST Parity Field ${suffix}`,
      required: 1
    });
    const mcpField = await callMcpTool('create_data_field', {
      course_id: courseId,
      module_id: database.course_module_id,
      field_type: 'menu',
      name: `MCP Parity Field ${suffix}`,
      options: { choices: ['Draft', 'Ready'] }
    });
    const cliField = await callCli([
      'create-data-field',
      '--course-id', String(courseId),
      '--module-id', String(database.course_module_id),
      '--field-type', 'textarea',
      '--name', `CLI Parity Field ${suffix}`,
      '--options', JSON.stringify({ rows: 3, columns: 40 })
    ]);

    for (const field of [restField, mcpField, cliField]) {
      assert.equal(field.module_id, database.course_module_id);
      assert.ok(field.field_id > 0);
      assert.deepEqual(
        Object.keys(normalizeDataField(field)).sort(),
        ['module_id', 'name', 'required', 'type']
      );
    }

    const listedFields = await callRestFunction(toRestFunctionName(contract, 'get_data_fields'), {
      course_id: courseId,
      module_id: database.course_module_id
    });
    for (const field of [restField, mcpField, cliField]) {
      assert.ok(
        listedFields.fields.some((listed) => listed.field_id === field.field_id && listed.name === field.name),
        `${field.name} must be visible through REST get_data_fields after creation`
      );
    }

    const makeEntryValues = (label) => ({
      [restField.name]: `${label} title ${suffix}`,
      [mcpField.name]: 'Ready',
      [cliField.name]: `${label} notes ${suffix}`
    });
    const restEntry = await callRestFunction(toRestFunctionName(contract, 'create_data_entry'), {
      course_id: courseId,
      module_id: database.course_module_id,
      values: JSON.stringify(makeEntryValues('REST'))
    });
    const mcpEntry = await callMcpTool('create_data_entry', {
      course_id: courseId,
      module_id: database.course_module_id,
      values: makeEntryValues('MCP')
    });
    const cliEntry = await callCli([
      'create-data-entry',
      '--course-id', String(courseId),
      '--module-id', String(database.course_module_id),
      '--values', JSON.stringify(makeEntryValues('CLI'))
    ]);

    for (const entry of [restEntry, mcpEntry, cliEntry]) {
      assert.equal(entry.module_id, database.course_module_id);
      assert.ok(entry.entry_id > 0);
      assert.deepEqual(Object.keys(normalizeDataEntry(entry)).sort(), ['contents_json', 'module_id']);
    }

    const listedEntries = await callRestFunction(toRestFunctionName(contract, 'get_data_entries'), {
      course_id: courseId,
      module_id: database.course_module_id,
      include_contents: 1
    });
    for (const entry of [restEntry, mcpEntry, cliEntry]) {
      assert.ok(
        listedEntries.entries.some((listed) => listed.entry_id === entry.entry_id),
        `Data entry ${entry.entry_id} must be visible through REST get_data_entries after creation`
      );
    }

    const qbank = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: 0,
      module_type: 'qbank',
      name: `MoodlIA Parity QBank ${suffix}`,
      options: JSON.stringify({
        intro: '<p>Question bank for transport parity.</p>',
        visible: true
      })
    });
    const quiz = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'quiz',
      name: `MoodlIA Parity Quiz ${suffix}`,
      options: JSON.stringify({
        intro: '<p>Quiz for transport parity.</p>',
        grade: 10,
        attempts: 1,
        preferred_behaviour: 'deferredfeedback',
        browser_security: 'none',
        visible: true
      })
    });
    const questionCategory = await callRestFunction(toRestFunctionName(contract, 'create_question_category'), {
      course_id: courseId,
      bank_scope: 'course_shared',
      question_bank_module_id: qbank.course_module_id,
      name: `MoodlIA Parity Questions ${suffix}`
    });

    const restQuestion = await callRestFunction(toRestFunctionName(contract, 'create_question'), {
      category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
      question_type: 'truefalse',
      name: `MoodlIA REST Parity Question ${suffix}`,
      question_text: '<p>REST parity question?</p>',
      options: JSON.stringify({ correct_answer: true })
    });
    const mcpQuestion = await callMcpTool('create_question', {
      category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
      question_type: 'truefalse',
      name: `MoodlIA MCP Parity Question ${suffix}`,
      question_text: '<p>MCP parity question?</p>',
      options: { correct_answer: true }
    });
    const cliQuestion = await callCli([
      'create-question',
      '--category-id', String(questionCategory.category_id),
      '--context-id', String(questionCategory.context_id),
      '--question-type', 'truefalse',
      '--name', `MoodlIA CLI Parity Question ${suffix}`,
      '--question-text', '<p>CLI parity question?</p>',
      '--options', JSON.stringify({ correct_answer: true })
    ]);

    const restSlot = await callRestFunction(toRestFunctionName(contract, 'add_question_to_quiz'), {
      quiz_module_id: quiz.course_module_id,
      question_id: restQuestion.question_id
    });
    const mcpSlot = await callMcpTool('add_question_to_quiz', {
      quiz_module_id: quiz.course_module_id,
      question_id: mcpQuestion.question_id
    });
    const cliSlot = await callCli([
      'add-question-to-quiz',
      '--quiz-module-id', String(quiz.course_module_id),
      '--question-id', String(cliQuestion.question_id)
    ]);

    for (const slot of [restSlot, mcpSlot, cliSlot]) {
      assert.equal(slot.quiz_module_id ?? quiz.course_module_id, quiz.course_module_id);
      assert.ok(slot.question_id > 0);
      assert.ok(slot.slot > 0);
      assert.ok(slot.maxmark > 0);
      assert.deepEqual(
        Object.keys(normalizeQuizSlot({ ...slot, quiz_module_id: quiz.course_module_id })).sort(),
        ['maxmark', 'question_id', 'quiz_module_id', 'slot']
      );
    }

    const listedQuizQuestions = await callRestFunction(toRestFunctionName(contract, 'get_quiz_questions'), {
      quiz_module_id: quiz.course_module_id
    });
    for (const question of [restQuestion, mcpQuestion, cliQuestion]) {
      assert.ok(
        listedQuizQuestions.questions.some((listed) => listed.question_id === question.question_id),
        `Question ${question.question_id} must be visible through REST get_quiz_questions after add_question_to_quiz`
      );
    }

    cleanupAllowed = true;
  } finally {
    if (cleanupAllowed && courseId !== null) {
      await callRestFunction(toRestFunctionName(contract, 'delete_course'), {
        course_id: courseId
      });
      courseId = null;
    } else if (courseId !== null) {
      console.error(`Transport parity course left in Moodle for inspection: ${courseId}`);
    }

    if (cleanupAllowed && categoryId !== null) {
      await callRestFunction(toRestFunctionName(contract, 'delete_course_category'), {
        category_id: categoryId
      });
      categoryId = null;
    } else if (categoryId !== null) {
      console.error(`Transport parity category left in Moodle for inspection: ${categoryId}`);
    }
  }
});
