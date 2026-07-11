import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';
import { resolveMoodleUrl } from '../../client/moodle-rest-client.mjs';
import { loadContract, toRestFunctionName } from '../helpers/contract.mjs';
import { getEnv, getTimeout, requireEnv, resolveCliCommand } from '../helpers/env.mjs';
import { callMcpRaw } from '../helpers/mcp.mjs';
import { fromRoot } from '../helpers/paths.mjs';

const execFileAsync = promisify(execFile);
const hasRestrictedConfig = requireEnv(['MOODLE_BASE_URL', 'MOODLE_REST_TOKEN', 'MOODLE_RESTRICTED_REST_TOKEN']);

async function callRestRaw(functionName, parameters = {}, token = getEnv('MOODLE_REST_TOKEN')) {
  const endpoint = resolveMoodleUrl(getEnv('MOODLE_BASE_URL'), 'webservice/rest/server.php');
  const body = new URLSearchParams({
    wstoken: token,
    wsfunction: functionName,
    moodlewsrestformat: 'json'
  });

  for (const [key, value] of Object.entries(parameters)) {
    if (value !== undefined && value !== null) {
      body.set(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value));
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getTimeout());

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body,
      redirect: 'error',
      signal: controller.signal
    });
    const text = await response.text();

    return {
      response,
      body: text ? JSON.parse(text) : null
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function callAdminRest(contract, operationName, parameters = {}) {
  const result = await callRestRaw(toRestFunctionName(contract, operationName), parameters);
  assert.equal(result.response.status, 200);
  assert.ok(
    !result.body?.exception && !result.body?.errorcode,
    `${operationName} should succeed for the admin token: ${JSON.stringify(result.body)}`
  );

  return result.body;
}

async function assertRestrictedRestDenied(contract, operationName, parameters, restrictedToken) {
  const result = await callRestRaw(toRestFunctionName(contract, operationName), parameters, restrictedToken);
  assert.equal(result.response.status, 200);
  assert.ok(
    result.body?.exception || result.body?.errorcode,
    `REST ${operationName} should fail for the restricted token.`
  );
  assertPermissionDeniedPayload(result.body, `REST ${operationName}`);
}

async function callRestrictedRestAllowed(contract, operationName, parameters, restrictedToken) {
  const result = await callRestRaw(toRestFunctionName(contract, operationName), parameters, restrictedToken);
  assert.equal(result.response.status, 200);
  assert.ok(
    !result.body?.exception && !result.body?.errorcode,
    `REST ${operationName} should succeed for the restricted token: ${JSON.stringify(result.body)}`
  );

  return result.body;
}

async function assertRestrictedMcpDenied(operationName, parameters, restrictedToken) {
  const result = await callMcpRaw({
    method: 'tools/call',
    token: restrictedToken,
    params: {
      name: operationName,
      arguments: parameters
    }
  });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.error?.code, -32005);
  assertPermissionDeniedPayload(result.body.error, `MCP ${operationName}`);
}

async function callRestrictedCliFailure(args) {
  const configured = resolveCliCommand();
  const localCli = fromRoot('cli/moodle-mcp.mjs');
  const commandPath = configured ?? localCli;
  const command = commandPath.endsWith('.mjs') || commandPath.endsWith('.js') ? process.execPath : commandPath;
  const commandArgs = command === process.execPath ? [commandPath, ...args, '--format', 'json'] : [...args, '--format', 'json'];

  try {
    await execFileAsync(command, commandArgs, {
      timeout: getTimeout(),
      env: {
        ...process.env,
        MOODLE_BASE_URL: getEnv('MOODLE_BASE_URL'),
        MOODLE_REST_TOKEN: getEnv('MOODLE_RESTRICTED_REST_TOKEN')
      }
    });
  } catch (error) {
    const rawError = (error.stderr || error.stdout || '').trim();
    assert.ok(rawError, 'restricted CLI failures should print a JSON error payload.');
    const payload = JSON.parse(rawError);
    assert.equal(payload.error, true);
    assert.equal(typeof payload.message, 'string');

    return payload;
  }

  assert.fail('Restricted CLI command was expected to fail.');
}

async function assertRestrictedCliDenied(args, label) {
  const payload = await callRestrictedCliFailure(args);
  assertPermissionDeniedPayload(payload, `CLI ${label}`);
}

function assertPermissionDeniedPayload(payload, label) {
  const encoded = JSON.stringify(payload);

  assert.doesNotMatch(
    encoded,
    /invalidrecordunknown|dml_missing_record_exception/i,
    `${label} should fail because of permissions, not because Moodle cannot resolve a service record`
  );
  assert.match(
    encoded,
    /capabilit|permission|nopermissions|access|acceso|permiso|denied|cannot|not allowed/i,
    `${label} should expose a permission or capability failure`
  );
}

function dataOptions(suffix) {
  return {
    intro: `<p>MoodlIA restricted database ${suffix}</p>`,
    approval_required: false,
    manage_approved: false,
    required_entries: 0,
    required_entries_to_view: 0,
    max_entries: 0,
    edit_any: true
  };
}

function workshopOptions(suffix) {
  const now = Math.floor(Date.now() / 1000);

  return {
    intro: `<p>MoodlIA restricted workshop ${suffix}</p>`,
    strategy: 'accumulative',
    submission_grade: 80,
    assessment_grade: 20,
    grade_decimals: 1,
    submission_instructions: `<p>Submit restricted work ${suffix}</p>`,
    assessment_instructions: `<p>Assess restricted work ${suffix}</p>`,
    text_submission: 'required',
    file_submission: 'available',
    max_submission_attachments: 1,
    late_submissions: true,
    self_assessment: false,
    example_submissions: false,
    examples_mode: 'voluntary',
    submission_start: now - 60,
    submission_end: now + 3600,
    assessment_start: now + 7200,
    assessment_end: now + 10800,
    switch_to_assessment_after_submission_deadline: false,
    conclusion: `<p>Restricted workshop conclusion ${suffix}</p>`
  };
}

test('restricted token can authenticate but cannot create course categories through REST, MCP, or CLI', {
  skip: !hasRestrictedConfig
}, async () => {
  const contract = await loadContract();
  const restrictedToken = getEnv('MOODLE_RESTRICTED_REST_TOKEN');
  const forbiddenCategoryName = `MoodlIA Forbidden Category ${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const currentUser = await callRestRaw(
    toRestFunctionName(contract, 'get_current_user'),
    {},
    restrictedToken
  );
  assert.equal(currentUser.response.status, 200);
  assert.ok(!currentUser.body?.exception && !currentUser.body?.errorcode, 'restricted token must be valid.');
  assert.equal(typeof currentUser.body?.username, 'string');

  const restDenied = await callRestRaw(
    toRestFunctionName(contract, 'create_course_category'),
    {
      name: forbiddenCategoryName,
      visible: 0
    },
    restrictedToken
  );
  assert.equal(restDenied.response.status, 200);
  assert.ok(
    restDenied.body?.exception || restDenied.body?.errorcode,
    'REST create_course_category should fail for the restricted token.'
  );
  assertPermissionDeniedPayload(restDenied.body, 'REST');

  const mcpAllowed = await callMcpRaw({
    method: 'tools/call',
    token: restrictedToken,
    params: {
      name: 'get_current_user',
      arguments: {}
    }
  });
  assert.equal(mcpAllowed.response.status, 200);
  assert.ok(!mcpAllowed.body.error, 'restricted token must be valid for MCP read calls.');
  assert.equal(typeof mcpAllowed.body.result?.structuredContent?.username, 'string');

  const mcpDenied = await callMcpRaw({
    method: 'tools/call',
    token: restrictedToken,
    params: {
      name: 'create_course_category',
      arguments: {
        name: forbiddenCategoryName,
        visible: false
      }
    }
  });
  assert.equal(mcpDenied.response.status, 200);
  assert.equal(mcpDenied.body.error?.code, -32005);
  assertPermissionDeniedPayload(mcpDenied.body.error, 'MCP');

  const cliDenied = await callRestrictedCliFailure([
    'create-course-category',
    '--name', forbiddenCategoryName,
    '--visible', 'false'
  ]);
  assertPermissionDeniedPayload(cliDenied, 'CLI');
});

test('restricted token cannot write courses, modules, questions, or quiz structure', {
  skip: !hasRestrictedConfig
}, async () => {
  const contract = await loadContract();
  const restrictedToken = getEnv('MOODLE_RESTRICTED_REST_TOKEN');
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let categoryId = null;
  let courseId = null;
  let cleanupAllowed = false;

  const currentUser = await callRestRaw(
    toRestFunctionName(contract, 'get_current_user'),
    {},
    restrictedToken
  );
  assert.equal(currentUser.response.status, 200);
  assert.ok(!currentUser.body?.exception && !currentUser.body?.errorcode, 'restricted token must be valid.');
  assert.equal(typeof currentUser.body?.id, 'number');

  try {
    const category = await callAdminRest(contract, 'create_course_category', {
      name: `MoodlIA Restricted Permission Category ${suffix}`,
      visible: 1
    });
    categoryId = category.category_id;

    const course = await callAdminRest(contract, 'create_course', {
      fullname: `MoodlIA Restricted Permission Course ${suffix}`,
      shortname: `moodlia-restricted-${suffix}`,
      category_id: categoryId,
      visible: 1,
      summary: `<p>MoodlIA restricted permission smoke course ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });
    courseId = course.course_id;

    const section = await callAdminRest(contract, 'create_section', {
      course_id: courseId,
      name: `MoodlIA Restricted Permission Section ${suffix}`
    });

    await callAdminRest(contract, 'enrol_user', {
      course_id: courseId,
      user_id: currentUser.body.id,
      role_archetype: 'student'
    });

    await assertRestrictedRestDenied(contract, 'export_course_blueprint', {
      course_id: courseId,
      include_contents: 1,
      include_groups: 1
    }, restrictedToken);

    await assertRestrictedRestDenied(contract, 'audit_course', {
      course_id: courseId
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'backup_course', {
      course_id: courseId,
      filename: `restricted-backup-${suffix}.mbz`
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'create_grade_category', {
      course_id: courseId,
      name: `MoodlIA Forbidden Grade Category ${suffix}`
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'create_grade_item', {
      course_id: courseId,
      name: `MoodlIA Forbidden Grade Item ${suffix}`,
      grade_max: 100
    }, restrictedToken);

    const qbank = await callAdminRest(contract, 'create_module', {
      course_id: courseId,
      section_number: 0,
      module_type: 'qbank',
      name: `MoodlIA Restricted Permission QBank ${suffix}`,
      options: JSON.stringify({
        intro: '<p>Question bank for restricted permission smoke.</p>',
        visible: true
      })
    });

    const quiz = await callAdminRest(contract, 'create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'quiz',
      name: `MoodlIA Restricted Permission Quiz ${suffix}`,
      options: JSON.stringify({
        intro: '<p>Quiz for restricted permission smoke.</p>',
        grade: 10,
        attempts: 1,
        preferred_behaviour: 'deferredfeedback',
        browser_security: 'none',
        visible: true
      })
    });

    const questionCategory = await callAdminRest(contract, 'create_question_category', {
      course_id: courseId,
      bank_scope: 'course_shared',
      question_bank_module_id: qbank.course_module_id,
      name: `MoodlIA Restricted Permission Questions ${suffix}`,
      description: 'Shared category for restricted permission smoke.'
    });

    const question = await callAdminRest(contract, 'create_question', {
      category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
      question_type: 'truefalse',
      name: `MoodlIA Restricted Permission Question ${suffix}`,
      question_text: '<p>Can a restricted user manage quiz questions?</p>',
      options: JSON.stringify({
        correct_answer: true,
        feedback_true: 'Correct.',
        feedback_false: 'Incorrect.'
      })
    });

    const quizQuestionSlot = await callAdminRest(contract, 'add_question_to_quiz', {
      quiz_module_id: quiz.course_module_id,
      question_id: question.question_id
    });

    const calendarEvent = await callAdminRest(contract, 'create_calendar_event', {
      course_id: courseId,
      name: `MoodlIA Restricted Permission Event ${suffix}`,
      timestart: Math.floor(Date.now() / 1000) + 3600,
      description: '<p>Calendar event used by restricted permission smoke.</p>',
      timeduration: 1800
    });

    const group = await callAdminRest(contract, 'create_group', {
      course_id: courseId,
      name: `MoodlIA Restricted Permission Group ${suffix}`,
      description: 'Group used by restricted permission smoke.'
    });

    const grouping = await callAdminRest(contract, 'create_grouping', {
      course_id: courseId,
      name: `MoodlIA Restricted Permission Grouping ${suffix}`,
      description: 'Grouping used by restricted permission smoke.'
    });

    await callAdminRest(contract, 'add_group_member', {
      course_id: courseId,
      group_id: group.group_id,
      user_id: currentUser.body.id
    });

    await callAdminRest(contract, 'add_group_to_grouping', {
      course_id: courseId,
      grouping_id: grouping.grouping_id,
      group_id: group.group_id
    });

    const page = await callAdminRest(contract, 'create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'page',
      name: `MoodlIA Restricted Permission Page ${suffix}`,
      options: JSON.stringify({
        content: '<p>Page used by restricted permission smoke.</p>',
        visible: true
      })
    });

    const database = await callAdminRest(contract, 'create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'data',
      name: `MoodlIA Restricted Permission Database ${suffix}`,
      options: JSON.stringify(dataOptions(suffix))
    });

    const dataField = await callAdminRest(contract, 'create_data_field', {
      course_id: courseId,
      module_id: database.course_module_id,
      field_type: 'text',
      name: `MoodlIA Restricted Permission Field ${suffix}`,
      description: 'Field used by restricted permission smoke.',
      required: 1
    });

    const dataEntry = await callAdminRest(contract, 'create_data_entry', {
      course_id: courseId,
      module_id: database.course_module_id,
      values: JSON.stringify({
        [dataField.name]: `MoodlIA restricted entry ${suffix}`
      })
    });

    const workshop = await callAdminRest(contract, 'create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'workshop',
      name: `MoodlIA Restricted Permission Workshop ${suffix}`,
      options: JSON.stringify(workshopOptions(suffix))
    });

    await callAdminRest(contract, 'set_workshop_phase', {
      course_id: courseId,
      module_id: workshop.course_module_id,
      phase: 'submission'
    });

    const workshopSubmission = await callAdminRest(contract, 'create_workshop_submission', {
      course_id: courseId,
      module_id: workshop.course_module_id,
      title: `MoodlIA Restricted Permission Workshop Submission ${suffix}`,
      content: '<p>Workshop submission used by restricted permission smoke.</p>',
      content_format: 'html'
    });

    const forum = await callAdminRest(contract, 'create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'forum',
      name: `MoodlIA Restricted Permission Forum ${suffix}`,
      options: JSON.stringify({
        forum_type: 'general',
        intro: '<p>Forum used by restricted permission smoke.</p>'
      })
    });

    const discussion = await callAdminRest(contract, 'create_forum_discussion', {
      course_id: courseId,
      module_id: forum.course_module_id,
      name: `MoodlIA Restricted Permission Discussion ${suffix}`,
      message: '<p>Discussion used by restricted permission smoke.</p>'
    });

    const assignment = await callAdminRest(contract, 'create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'assign',
      name: `MoodlIA Restricted Permission Assignment ${suffix}`,
      options: JSON.stringify({
        activity: '<p>Assignment used by restricted permission smoke.</p>',
        online_text: true,
        file_submissions: false,
        submission_drafts: true,
        require_submission_statement: false,
        grade: 100,
        feedback_comments: true
      })
    });

    const folder = await callAdminRest(contract, 'create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'folder',
      name: `MoodlIA Restricted Permission Folder ${suffix}`,
      options: JSON.stringify({
        intro: '<p>Folder used by restricted permission smoke.</p>',
        show_expanded: true
      })
    });

    const glossary = await callAdminRest(contract, 'create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'glossary',
      name: `MoodlIA Restricted Permission Glossary ${suffix}`,
      options: JSON.stringify({
        intro: '<p>Glossary used by restricted permission smoke.</p>',
        glossary_type: 'secondary',
        entries_by_page: 10,
        allow_duplicate_entries: false,
        allow_comments: false,
        allow_print_view: true,
        approval_display_format: 'dictionary',
        display_format: 'dictionary',
        default_approval: true
      })
    });

    const glossaryEntry = await callAdminRest(contract, 'create_glossary_entry', {
      course_id: courseId,
      module_id: glossary.course_module_id,
      concept: `MoodlIA Restricted Permission Concept ${suffix}`,
      definition: '<p>Glossary entry used by restricted permission smoke.</p>',
      definition_format: 'html'
    });

    const wiki = await callAdminRest(contract, 'create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'wiki',
      name: `MoodlIA Restricted Permission Wiki ${suffix}`,
      options: JSON.stringify({
        intro: '<p>Wiki used by restricted permission smoke.</p>',
        first_page_title: `MoodlIA Restricted Permission Wiki Home ${suffix}`,
        wiki_mode: 'collaborative',
        default_format: 'html'
      })
    });

    const wikiPage = await callAdminRest(contract, 'create_wiki_page', {
      course_id: courseId,
      module_id: wiki.course_module_id,
      title: `MoodlIA Restricted Permission Wiki Page ${suffix}`,
      content: '<p>Wiki page used by restricted permission smoke.</p>',
      content_format: 'html'
    });

    const feedback = await callAdminRest(contract, 'create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'feedback',
      name: `MoodlIA Restricted Permission Feedback ${suffix}`,
      options: JSON.stringify({
        intro: '<p>Feedback used by restricted permission smoke.</p>',
        anonymous: 'anonymous',
        multiple_submit: true
      })
    });

    const folderFile = await callAdminRest(contract, 'upload_folder_file', {
      course_id: courseId,
      module_id: folder.course_module_id,
      filename: `restricted-permission-${suffix}.txt`,
      upload_reference: Buffer.from(`Restricted permission file ${suffix}`, 'utf8').toString('base64')
    });

    const targetQuestionCategory = await callAdminRest(contract, 'create_question_category', {
      course_id: courseId,
      bank_scope: 'course_shared',
      question_bank_module_id: qbank.course_module_id,
      name: `MoodlIA Restricted Permission Target Questions ${suffix}`,
      description: 'Target category for restricted permission smoke.'
    });

    await assertRestrictedRestDenied(contract, 'create_course', {
      fullname: `MoodlIA Forbidden Course ${suffix}`,
      shortname: `moodlia-forbidden-${suffix}`,
      category_id: categoryId,
      visible: 0,
      course_format: 'topics'
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'create_section', {
      course_id: courseId,
      name: `MoodlIA Forbidden Section ${suffix}`
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'update_section', {
      course_id: courseId,
      section_id: section.section_id,
      name: `MoodlIA Forbidden Updated Section ${suffix}`,
      summary: 'Restricted users must not update sections.',
      visible: 0
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'delete_section', {
      course_id: courseId,
      section_id: section.section_id,
      delete_mode: 'clear'
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'page',
      name: `MoodlIA Forbidden Page ${suffix}`,
      options: JSON.stringify({
        content: '<p>Restricted users must not create activities.</p>',
        visible: true
      })
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'update_module', {
      course_id: courseId,
      module_id: page.course_module_id,
      name: `MoodlIA Forbidden Updated Page ${suffix}`,
      visible: 0
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'delete_module', {
      course_id: courseId,
      module_id: page.course_module_id
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'duplicate_module', {
      course_id: courseId,
      module_id: page.course_module_id,
      section_number: section.section_number,
      name: `MoodlIA Forbidden Duplicate Page ${suffix}`
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'move_module', {
      course_id: courseId,
      module_id: page.course_module_id,
      section_number: 0
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'create_question_category', {
      course_id: courseId,
      bank_scope: 'course_shared',
      question_bank_module_id: qbank.course_module_id,
      name: `MoodlIA Forbidden Question Category ${suffix}`
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'create_question', {
      category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
      question_type: 'truefalse',
      name: `MoodlIA Forbidden Question ${suffix}`,
      question_text: '<p>Should this be created?</p>',
      options: JSON.stringify({ correct_answer: false })
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'update_question', {
      question_id: question.question_id,
      name: `MoodlIA Forbidden Updated Question ${suffix}`
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'delete_question', {
      question_id: question.question_id
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'move_question', {
      course_id: courseId,
      question_id: question.question_id,
      target_category_id: targetQuestionCategory.category_id,
      target_bank_scope: 'course_shared',
      target_question_bank_module_id: qbank.course_module_id
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'add_question_to_quiz', {
      quiz_module_id: quiz.course_module_id,
      question_id: question.question_id
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'add_random_questions_to_quiz', {
      quiz_module_id: quiz.course_module_id,
      category_id: questionCategory.category_id,
      number: 1,
      include_subcategories: 0,
      bank_scope: 'course_shared',
      question_bank_module_id: qbank.course_module_id
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'update_quiz_question_slot', {
      quiz_module_id: quiz.course_module_id,
      slot: quizQuestionSlot.slot,
      max_mark: 2.5
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'remove_question_from_quiz', {
      quiz_module_id: quiz.course_module_id,
      slot: quizQuestionSlot.slot
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'create_calendar_event', {
      course_id: courseId,
      name: `MoodlIA Forbidden Event ${suffix}`,
      timestart: Math.floor(Date.now() / 1000) + 3600,
      description: '<p>Restricted users must not create calendar events.</p>',
      timeduration: 1800
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'update_calendar_event', {
      course_id: courseId,
      event_id: calendarEvent.event_id,
      name: `MoodlIA Forbidden Updated Event ${suffix}`,
      description: '<p>Restricted users must not update calendar events.</p>',
      timestart: Math.floor(Date.now() / 1000) + 7200,
      timeduration: 900
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'delete_calendar_event', {
      course_id: courseId,
      event_id: calendarEvent.event_id
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'create_group', {
      course_id: courseId,
      name: `MoodlIA Forbidden Group ${suffix}`,
      description: 'Restricted users must not create groups.'
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'update_group', {
      course_id: courseId,
      group_id: group.group_id,
      name: `MoodlIA Forbidden Updated Group ${suffix}`
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'delete_group', {
      course_id: courseId,
      group_id: group.group_id
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'create_grouping', {
      course_id: courseId,
      name: `MoodlIA Forbidden Grouping ${suffix}`,
      description: 'Restricted users must not create groupings.'
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'update_grouping', {
      course_id: courseId,
      grouping_id: grouping.grouping_id,
      name: `MoodlIA Forbidden Updated Grouping ${suffix}`
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'delete_grouping', {
      course_id: courseId,
      grouping_id: grouping.grouping_id
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'add_group_to_grouping', {
      course_id: courseId,
      grouping_id: grouping.grouping_id,
      group_id: group.group_id
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'remove_group_from_grouping', {
      course_id: courseId,
      grouping_id: grouping.grouping_id,
      group_id: group.group_id
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'add_group_member', {
      course_id: courseId,
      group_id: group.group_id,
      user_id: currentUser.body.id
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'remove_group_member', {
      course_id: courseId,
      group_id: group.group_id,
      user_id: currentUser.body.id
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'create_data_field', {
      course_id: courseId,
      module_id: database.course_module_id,
      field_type: 'text',
      name: `MoodlIA Forbidden Data Field ${suffix}`,
      description: 'Restricted users must not manage database fields.',
      required: 1
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'update_data_field', {
      course_id: courseId,
      module_id: database.course_module_id,
      field_id: dataField.field_id,
      name: `MoodlIA Forbidden Updated Data Field ${suffix}`,
      required: 0
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'delete_data_field', {
      course_id: courseId,
      module_id: database.course_module_id,
      field_id: dataField.field_id
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'update_data_entry', {
      course_id: courseId,
      module_id: database.course_module_id,
      entry_id: dataEntry.entry_id,
      values: JSON.stringify({
        [dataField.name]: `MoodlIA forbidden updated entry ${suffix}`
      })
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'delete_data_entry', {
      course_id: courseId,
      module_id: database.course_module_id,
      entry_id: dataEntry.entry_id
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'set_workshop_phase', {
      course_id: courseId,
      module_id: workshop.course_module_id,
      phase: 'submission'
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'update_workshop_submission', {
      course_id: courseId,
      module_id: workshop.course_module_id,
      submission_id: workshopSubmission.submission_id,
      title: `MoodlIA Forbidden Updated Workshop Submission ${suffix}`,
      content: '<p>Restricted users must not update workshop submissions they do not own.</p>',
      content_format: 'html'
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'delete_workshop_submission', {
      course_id: courseId,
      module_id: workshop.course_module_id,
      submission_id: workshopSubmission.submission_id
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'allocate_workshop_submission', {
      course_id: courseId,
      module_id: workshop.course_module_id,
      submission_id: workshopSubmission.submission_id,
      reviewer_id: currentUser.body.id,
      weight: 1
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'set_forum_discussion_pin', {
      course_id: courseId,
      module_id: forum.course_module_id,
      discussion_id: discussion.discussion_id,
      pinned: 1
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'set_forum_discussion_lock', {
      course_id: courseId,
      module_id: forum.course_module_id,
      discussion_id: discussion.discussion_id,
      locked: 1
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'save_assignment_grade', {
      course_id: courseId,
      module_id: assignment.course_module_id,
      user_id: currentUser.body.id,
      grade: 75,
      feedback_comment: '<p>Restricted users must not grade assignments.</p>'
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'update_glossary_entry', {
      course_id: courseId,
      module_id: glossary.course_module_id,
      entry_id: glossaryEntry.entry_id,
      concept: `MoodlIA Forbidden Updated Concept ${suffix}`,
      definition: '<p>Restricted users must not update glossary entries.</p>',
      definition_format: 'html'
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'delete_glossary_entry', {
      course_id: courseId,
      module_id: glossary.course_module_id,
      entry_id: glossaryEntry.entry_id
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'delete_wiki_page', {
      course_id: courseId,
      module_id: wiki.course_module_id,
      page_id: wikiPage.page_id
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'upload_folder_file', {
      course_id: courseId,
      module_id: folder.course_module_id,
      filename: `forbidden-${suffix}.txt`,
      upload_reference: Buffer.from(`Restricted upload ${suffix}`, 'utf8').toString('base64')
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'delete_folder_file', {
      course_id: courseId,
      module_id: folder.course_module_id,
      file_id: folderFile.file_id
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'delete_feedback_item', {
      course_id: courseId,
      module_id: feedback.course_module_id,
      item_id: 999999999
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'create_feedback_item', {
      course_id: courseId,
      module_id: feedback.course_module_id,
      type: 'captcha',
      definition: JSON.stringify({})
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'create_course_from_blueprint', {
      blueprint: JSON.stringify({
        course: {
          fullname: `MoodlIA Restricted Blueprint ${suffix}`,
          shortname: `moodlia-restricted-blueprint-${suffix}`,
          category_id: categoryId
        },
        sections: [
          {
            name: 'Restricted blueprint section'
          }
        ]
      })
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'apply_course_blueprint', {
      course_id: courseId,
      blueprint: JSON.stringify({
        sections: [
          {
            name: 'Restricted apply section'
          }
        ]
      })
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'copy_course_structure', {
      source_course_id: courseId,
      target_course_id: courseId,
      include_contents: 1,
      include_groups: 0
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'sync_course_enrolments', {
      course_id: courseId,
      enrolments: JSON.stringify([
        {
          user_id: currentUser.body.id,
          role_archetype: 'student'
        }
      ])
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'set_course_publish_state', {
      course_id: courseId,
      publish_state: 'published'
    }, restrictedToken);

    await assertRestrictedMcpDenied('create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'page',
      name: `MoodlIA MCP Forbidden Page ${suffix}`,
      options: {
        content: '<p>Restricted users must not create MCP activities.</p>',
        visible: true
      }
    }, restrictedToken);
    await assertRestrictedMcpDenied('duplicate_module', {
      course_id: courseId,
      module_id: page.course_module_id,
      section_number: section.section_number,
      name: `MoodlIA MCP Forbidden Duplicate Page ${suffix}`
    }, restrictedToken);
    await assertRestrictedMcpDenied('create_question', {
      category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
      question_type: 'truefalse',
      name: `MoodlIA MCP Forbidden Question ${suffix}`,
      question_text: '<p>Should MCP create this?</p>',
      options: { correct_answer: false }
    }, restrictedToken);
    await assertRestrictedMcpDenied('update_question', {
      question_id: question.question_id,
      name: `MoodlIA MCP Forbidden Updated Question ${suffix}`
    }, restrictedToken);
    await assertRestrictedMcpDenied('add_question_to_quiz', {
      quiz_module_id: quiz.course_module_id,
      question_id: question.question_id
    }, restrictedToken);
    await assertRestrictedMcpDenied('add_random_questions_to_quiz', {
      quiz_module_id: quiz.course_module_id,
      category_id: questionCategory.category_id,
      number: 1,
      include_subcategories: false,
      bank_scope: 'course_shared',
      question_bank_module_id: qbank.course_module_id
    }, restrictedToken);
    await assertRestrictedMcpDenied('create_group', {
      course_id: courseId,
      name: `MoodlIA MCP Forbidden Group ${suffix}`,
      description: 'Restricted users must not create MCP groups.'
    }, restrictedToken);
    await assertRestrictedMcpDenied('remove_group_from_grouping', {
      course_id: courseId,
      grouping_id: grouping.grouping_id,
      group_id: group.group_id
    }, restrictedToken);
    await assertRestrictedMcpDenied('create_data_field', {
      course_id: courseId,
      module_id: database.course_module_id,
      field_type: 'text',
      name: `MoodlIA MCP Forbidden Data Field ${suffix}`,
      description: 'Restricted users must not manage MCP database fields.',
      required: true
    }, restrictedToken);
    await assertRestrictedMcpDenied('set_forum_discussion_pin', {
      course_id: courseId,
      module_id: forum.course_module_id,
      discussion_id: discussion.discussion_id,
      pinned: true
    }, restrictedToken);
    await assertRestrictedMcpDenied('allocate_workshop_submission', {
      course_id: courseId,
      module_id: workshop.course_module_id,
      submission_id: workshopSubmission.submission_id,
      reviewer_id: currentUser.body.id,
      weight: 1
    }, restrictedToken);
    await assertRestrictedMcpDenied('save_assignment_grade', {
      course_id: courseId,
      module_id: assignment.course_module_id,
      user_id: currentUser.body.id,
      grade: 75,
      feedback_comment: '<p>Restricted users must not grade MCP assignments.</p>'
    }, restrictedToken);
    await assertRestrictedMcpDenied('upload_folder_file', {
      course_id: courseId,
      module_id: folder.course_module_id,
      filename: `mcp-forbidden-${suffix}.txt`,
      upload_reference: Buffer.from(`Restricted MCP upload ${suffix}`, 'utf8').toString('base64')
    }, restrictedToken);
    await assertRestrictedMcpDenied('delete_folder_file', {
      course_id: courseId,
      module_id: folder.course_module_id,
      file_id: folderFile.file_id
    }, restrictedToken);
    await assertRestrictedMcpDenied('apply_course_blueprint', {
      course_id: courseId,
      blueprint: {
        sections: [
          {
            name: 'Restricted MCP apply section'
          }
        ]
      }
    }, restrictedToken);
    await assertRestrictedMcpDenied('set_course_publish_state', {
      course_id: courseId,
      publish_state: 'published'
    }, restrictedToken);

    await assertRestrictedCliDenied([
      'create-section',
      '--course-id', String(courseId),
      '--name', `MoodlIA CLI Forbidden Section ${suffix}`
    ], 'create_section');
    await assertRestrictedCliDenied([
      'create-module',
      '--course-id', String(courseId),
      '--section-number', String(section.section_number),
      '--module-type', 'page',
      '--name', `MoodlIA CLI Forbidden Page ${suffix}`,
      '--options', JSON.stringify({
        content: '<p>Restricted users must not create CLI activities.</p>',
        visible: true
      })
    ], 'create_module');
    await assertRestrictedCliDenied([
      'duplicate-module',
      '--course-id', String(courseId),
      '--module-id', String(page.course_module_id),
      '--section-number', String(section.section_number),
      '--name', `MoodlIA CLI Forbidden Duplicate Page ${suffix}`
    ], 'duplicate_module');
    await assertRestrictedCliDenied([
      'move-module',
      '--course-id', String(courseId),
      '--module-id', String(page.course_module_id),
      '--section-number', '0'
    ], 'move_module');
    await assertRestrictedCliDenied([
      'create-question',
      '--category-id', String(questionCategory.category_id),
      '--context-id', String(questionCategory.context_id),
      '--question-type', 'truefalse',
      '--name', `MoodlIA CLI Forbidden Question ${suffix}`,
      '--question-text', '<p>Should CLI create this?</p>',
      '--options', JSON.stringify({ correct_answer: false })
    ], 'create_question');
    await assertRestrictedCliDenied([
      'add-question-to-quiz',
      '--quiz-module-id', String(quiz.course_module_id),
      '--question-id', String(question.question_id)
    ], 'add_question_to_quiz');
    await assertRestrictedCliDenied([
      'add-random-questions-to-quiz',
      '--quiz-module-id', String(quiz.course_module_id),
      '--category-id', String(questionCategory.category_id),
      '--number', '1',
      '--include-subcategories', 'false',
      '--bank-scope', 'course_shared',
      '--question-bank-module-id', String(qbank.course_module_id)
    ], 'add_random_questions_to_quiz');
    await assertRestrictedCliDenied([
      'create-group',
      '--course-id', String(courseId),
      '--name', `MoodlIA CLI Forbidden Group ${suffix}`,
      '--description', 'Restricted users must not create CLI groups.'
    ], 'create_group');
    await assertRestrictedCliDenied([
      'remove-group-from-grouping',
      '--course-id', String(courseId),
      '--grouping-id', String(grouping.grouping_id),
      '--group-id', String(group.group_id)
    ], 'remove_group_from_grouping');
    await assertRestrictedCliDenied([
      'create-data-field',
      '--course-id', String(courseId),
      '--module-id', String(database.course_module_id),
      '--field-type', 'text',
      '--name', `MoodlIA CLI Forbidden Data Field ${suffix}`,
      '--description', 'Restricted users must not manage CLI database fields.',
      '--required', 'true'
    ], 'create_data_field');
    await assertRestrictedCliDenied([
      'set-forum-discussion-pin',
      '--course-id', String(courseId),
      '--module-id', String(forum.course_module_id),
      '--discussion-id', String(discussion.discussion_id),
      '--pinned', 'true'
    ], 'set_forum_discussion_pin');
    await assertRestrictedCliDenied([
      'save-assignment-grade',
      '--course-id', String(courseId),
      '--module-id', String(assignment.course_module_id),
      '--user-id', String(currentUser.body.id),
      '--grade', '75',
      '--feedback-comment', '<p>Restricted users must not grade CLI assignments.</p>'
    ], 'save_assignment_grade');
    await assertRestrictedCliDenied([
      'allocate-workshop-submission',
      '--course-id', String(courseId),
      '--module-id', String(workshop.course_module_id),
      '--submission-id', String(workshopSubmission.submission_id),
      '--reviewer-id', String(currentUser.body.id),
      '--weight', '1'
    ], 'allocate_workshop_submission');
    await assertRestrictedCliDenied([
      'upload-folder-file',
      '--course-id', String(courseId),
      '--module-id', String(folder.course_module_id),
      '--filename', `cli-forbidden-${suffix}.txt`,
      '--upload-reference', Buffer.from(`Restricted CLI upload ${suffix}`, 'utf8').toString('base64')
    ], 'upload_folder_file');
    await assertRestrictedCliDenied([
      'delete-folder-file',
      '--course-id', String(courseId),
      '--module-id', String(folder.course_module_id),
      '--file-id', String(folderFile.file_id)
    ], 'delete_folder_file');
    await assertRestrictedCliDenied([
      'apply-course-blueprint',
      '--course-id', String(courseId),
      '--blueprint', JSON.stringify({
        sections: [
          {
            name: 'Restricted CLI apply section'
          }
        ]
      })
    ], 'apply_course_blueprint');
    await assertRestrictedCliDenied([
      'set-course-publish-state',
      '--course-id', String(courseId),
      '--publish-state', 'published'
    ], 'set_course_publish_state');

    cleanupAllowed = true;
  } finally {
    if (cleanupAllowed && courseId !== null) {
      await callAdminRest(contract, 'unenrol_user', {
        course_id: courseId,
        user_id: currentUser.body.id
      });
      await callAdminRest(contract, 'delete_course', {
        course_id: courseId
      });
      courseId = null;
    }

    if (cleanupAllowed && categoryId !== null) {
      await callAdminRest(contract, 'delete_course_category', {
        category_id: categoryId
      });
      categoryId = null;
    }
  }
});

test('restricted token can perform Moodle-approved student writes only on its own work', {
  skip: !hasRestrictedConfig
}, async () => {
  const contract = await loadContract();
  const restrictedToken = getEnv('MOODLE_RESTRICTED_REST_TOKEN');
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let categoryId = null;
  let courseId = null;
  let cleanupAllowed = false;

  const restrictedUser = await callRestrictedRestAllowed(contract, 'get_current_user', {}, restrictedToken);
  const adminUser = await callAdminRest(contract, 'get_current_user');

  try {
    const category = await callAdminRest(contract, 'create_course_category', {
      name: `MoodlIA Student Writes Category ${suffix}`,
      visible: 1
    });
    categoryId = category.category_id;

    const course = await callAdminRest(contract, 'create_course', {
      fullname: `MoodlIA Student Writes Course ${suffix}`,
      shortname: `moodlia-student-writes-${suffix}`,
      category_id: categoryId,
      visible: 1,
      summary: `<p>MoodlIA student writes permission smoke ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });
    courseId = course.course_id;

    const section = await callAdminRest(contract, 'create_section', {
      course_id: courseId,
      name: `MoodlIA Student Writes Section ${suffix}`
    });

    await callAdminRest(contract, 'enrol_user', {
      course_id: courseId,
      user_id: restrictedUser.id,
      role_archetype: 'student'
    });

    const database = await callAdminRest(contract, 'create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'data',
      name: `MoodlIA Student Writes Database ${suffix}`,
      options: JSON.stringify(dataOptions(suffix))
    });
    const dataField = await callAdminRest(contract, 'create_data_field', {
      course_id: courseId,
      module_id: database.course_module_id,
      field_type: 'text',
      name: `MoodlIA Student Writes Field ${suffix}`,
      required: 1
    });
    const ownDataEntry = await callRestrictedRestAllowed(contract, 'create_data_entry', {
      course_id: courseId,
      module_id: database.course_module_id,
      values: JSON.stringify({
        [dataField.name]: `Restricted user data entry ${suffix}`
      })
    }, restrictedToken);
    assert.equal(ownDataEntry.module_id, database.course_module_id);
    assert.match(ownDataEntry.contents_json, /Restricted user data entry/);

    const updatedOwnDataEntry = await callRestrictedRestAllowed(contract, 'update_data_entry', {
      course_id: courseId,
      module_id: database.course_module_id,
      entry_id: ownDataEntry.entry_id,
      values: JSON.stringify({
        [dataField.name]: `Restricted user updated data entry ${suffix}`
      })
    }, restrictedToken);
    assert.equal(updatedOwnDataEntry.entry_id, ownDataEntry.entry_id);
    assert.match(updatedOwnDataEntry.contents_json, /updated data entry/);

    const glossary = await callAdminRest(contract, 'create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'glossary',
      name: `MoodlIA Student Writes Glossary ${suffix}`,
      options: JSON.stringify({
        intro: '<p>Glossary used by student write smoke.</p>',
        glossary_type: 'secondary',
        entries_by_page: 10,
        allow_duplicate_entries: false,
        allow_comments: false,
        default_approval: true
      })
    });
    const adminGlossaryEntry = await callAdminRest(contract, 'create_glossary_entry', {
      course_id: courseId,
      module_id: glossary.course_module_id,
      concept: `MoodlIA Admin Glossary Concept ${suffix}`,
      definition: '<p>Admin-owned glossary entry.</p>',
      definition_format: 'html'
    });
    const ownGlossaryEntry = await callRestrictedRestAllowed(contract, 'create_glossary_entry', {
      course_id: courseId,
      module_id: glossary.course_module_id,
      concept: `MoodlIA Student Glossary Concept ${suffix}`,
      definition: '<p>Student-owned glossary entry.</p>',
      definition_format: 'html'
    }, restrictedToken);
    assert.equal(ownGlossaryEntry.module_id, glossary.course_module_id);

    const updatedOwnGlossaryEntry = await callRestrictedRestAllowed(contract, 'update_glossary_entry', {
      course_id: courseId,
      module_id: glossary.course_module_id,
      entry_id: ownGlossaryEntry.entry_id,
      concept: `MoodlIA Student Updated Glossary Concept ${suffix}`,
      definition: '<p>Student-owned updated glossary entry.</p>',
      definition_format: 'html'
    }, restrictedToken);
    assert.equal(updatedOwnGlossaryEntry.entry_id, ownGlossaryEntry.entry_id);
    assert.match(updatedOwnGlossaryEntry.definition, /updated glossary entry/);
    await assertRestrictedRestDenied(contract, 'update_glossary_entry', {
      course_id: courseId,
      module_id: glossary.course_module_id,
      entry_id: adminGlossaryEntry.entry_id,
      concept: `MoodlIA Forbidden Admin Glossary Concept ${suffix}`,
      definition: '<p>Student must not edit an admin-owned glossary entry.</p>',
      definition_format: 'html'
    }, restrictedToken);

    const wiki = await callAdminRest(contract, 'create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'wiki',
      name: `MoodlIA Student Writes Wiki ${suffix}`,
      options: JSON.stringify({
        intro: '<p>Wiki used by student write smoke.</p>',
        first_page_title: `MoodlIA Student Writes Wiki Home ${suffix}`,
        wiki_mode: 'collaborative',
        default_format: 'html'
      })
    });
    const ownWikiPage = await callRestrictedRestAllowed(contract, 'create_wiki_page', {
      course_id: courseId,
      module_id: wiki.course_module_id,
      title: `MoodlIA Student Wiki Page ${suffix}`,
      content: '<p>Student-created wiki page.</p>',
      content_format: 'html'
    }, restrictedToken);
    assert.equal(ownWikiPage.module_id, wiki.course_module_id);
    assert.equal(ownWikiPage.can_edit, true);

    const updatedOwnWikiPage = await callRestrictedRestAllowed(contract, 'update_wiki_page', {
      course_id: courseId,
      module_id: wiki.course_module_id,
      page_id: ownWikiPage.page_id,
      content: '<p>Student-updated wiki page.</p>'
    }, restrictedToken);
    assert.equal(updatedOwnWikiPage.page_id, ownWikiPage.page_id);
    assert.match(updatedOwnWikiPage.content, /Student-updated wiki page/);

    const forum = await callAdminRest(contract, 'create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'forum',
      name: `MoodlIA Student Writes Forum ${suffix}`,
      options: JSON.stringify({
        forum_type: 'general',
        intro: '<p>Forum used by student write smoke.</p>'
      })
    });
    const adminDiscussion = await callAdminRest(contract, 'create_forum_discussion', {
      course_id: courseId,
      module_id: forum.course_module_id,
      name: `MoodlIA Admin Forum Discussion ${suffix}`,
      message: '<p>Admin-owned discussion.</p>'
    });
    const adminPosts = await callAdminRest(contract, 'get_forum_discussion_posts', {
      course_id: courseId,
      module_id: forum.course_module_id,
      discussion_id: adminDiscussion.discussion_id
    });
    const adminPost = adminPosts.posts.find((post) => post.user_id === adminUser.id);
    assert.ok(adminPost, 'Admin-created forum discussion must expose an admin-owned first post.');

    const ownForumDiscussion = await callRestrictedRestAllowed(contract, 'create_forum_discussion', {
      course_id: courseId,
      module_id: forum.course_module_id,
      name: `MoodlIA Student Forum Discussion ${suffix}`,
      message: '<p>Student-owned discussion.</p>'
    }, restrictedToken);
    assert.equal(ownForumDiscussion.user_id, restrictedUser.id);

    const ownReply = await callRestrictedRestAllowed(contract, 'create_forum_discussion_post', {
      course_id: courseId,
      module_id: forum.course_module_id,
      discussion_id: adminDiscussion.discussion_id,
      parent_post_id: adminPost.post_id,
      subject: `MoodlIA Student Reply ${suffix}`,
      message: '<p>Student-owned reply.</p>'
    }, restrictedToken);
    assert.equal(ownReply.user_id, restrictedUser.id);

    const favouriteDiscussion = await callRestrictedRestAllowed(contract, 'set_forum_discussion_favourite', {
      course_id: courseId,
      module_id: forum.course_module_id,
      discussion_id: adminDiscussion.discussion_id,
      favourite: 1
    }, restrictedToken);
    assert.equal(favouriteDiscussion.discussion_id, adminDiscussion.discussion_id);
    assert.equal(favouriteDiscussion.favourite, true);

    const subscribedDiscussion = await callRestrictedRestAllowed(contract, 'set_forum_discussion_subscription', {
      course_id: courseId,
      module_id: forum.course_module_id,
      discussion_id: adminDiscussion.discussion_id,
      subscribed: 1
    }, restrictedToken);
    assert.equal(subscribedDiscussion.discussion_id, adminDiscussion.discussion_id);
    assert.equal(subscribedDiscussion.subscribed, true);

    await assertRestrictedRestDenied(contract, 'update_forum_discussion_post', {
      course_id: courseId,
      module_id: forum.course_module_id,
      discussion_id: adminDiscussion.discussion_id,
      post_id: ownReply.post_id,
      subject: `MoodlIA Student Updated Reply ${suffix}`,
      message: '<p>Student-owned updated reply.</p>'
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'update_forum_discussion_post', {
      course_id: courseId,
      module_id: forum.course_module_id,
      discussion_id: adminDiscussion.discussion_id,
      post_id: adminPost.post_id,
      subject: `MoodlIA Forbidden Admin Post Update ${suffix}`,
      message: '<p>Student must not update an admin-owned post.</p>'
    }, restrictedToken);
    await assertRestrictedRestDenied(contract, 'delete_forum_discussion_post', {
      course_id: courseId,
      module_id: forum.course_module_id,
      discussion_id: adminDiscussion.discussion_id,
      post_id: adminPost.post_id
    }, restrictedToken);

    const assignment = await callAdminRest(contract, 'create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'assign',
      name: `MoodlIA Student Writes Assignment ${suffix}`,
      options: JSON.stringify({
        activity: '<p>Assignment used by student write smoke.</p>',
        online_text: true,
        file_submissions: false,
        submission_drafts: true,
        require_submission_statement: false,
        grade: 100,
        feedback_comments: true
      })
    });
    const savedSubmission = await callRestrictedRestAllowed(contract, 'save_assignment_submission', {
      course_id: courseId,
      module_id: assignment.course_module_id,
      online_text: `<p>Restricted assignment submission ${suffix}</p>`
    }, restrictedToken);
    assert.match(savedSubmission.online_text, /Restricted assignment submission/);

    const submittedAssignment = await callRestrictedRestAllowed(contract, 'submit_assignment_for_grading', {
      course_id: courseId,
      module_id: assignment.course_module_id
    }, restrictedToken);
    assert.equal(submittedAssignment.submitted, true);

    const choice = await callAdminRest(contract, 'create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'choice',
      name: `MoodlIA Student Writes Choice ${suffix}`,
      options: JSON.stringify({
        intro: '<p>Choice used by student write smoke.</p>',
        choices: [
          `MoodlIA Student Choice A ${suffix}`,
          `MoodlIA Student Choice B ${suffix}`
        ],
        display: 'horizontal',
        allow_update: true,
        allow_multiple: false,
        limit_answers: true,
        limits: [5, 5],
        show_available: true,
        show_preview: false,
        show_results: 'always',
        publish: 'anonymous',
        show_unanswered: true,
        include_inactive: false,
        time_open: Math.floor(Date.now() / 1000) - 60,
        time_close: Math.floor(Date.now() / 1000) + 86400
      })
    });
    const choiceOptions = await callRestrictedRestAllowed(contract, 'get_choice_options', {
      course_id: courseId,
      choice_module_id: choice.course_module_id
    }, restrictedToken);
    const selectedChoice = choiceOptions.options[0];
    assert.ok(selectedChoice.option_id > 0);

    const submittedChoice = await callRestrictedRestAllowed(contract, 'submit_choice_response', {
      course_id: courseId,
      choice_module_id: choice.course_module_id,
      option_ids: JSON.stringify([selectedChoice.option_id])
    }, restrictedToken);
    assert.equal(submittedChoice.submitted, true);

    const deletedChoiceResponse = await callRestrictedRestAllowed(contract, 'delete_choice_responses', {
      course_id: courseId,
      choice_module_id: choice.course_module_id
    }, restrictedToken);
    assert.equal(deletedChoiceResponse.deleted, true);

    const workshop = await callAdminRest(contract, 'create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'workshop',
      name: `MoodlIA Student Writes Workshop ${suffix}`,
      options: JSON.stringify(workshopOptions(suffix))
    });
    await callAdminRest(contract, 'set_workshop_phase', {
      course_id: courseId,
      module_id: workshop.course_module_id,
      phase: 'submission'
    });
    const adminWorkshopSubmission = await callAdminRest(contract, 'create_workshop_submission', {
      course_id: courseId,
      module_id: workshop.course_module_id,
      title: `MoodlIA Admin Workshop Submission ${suffix}`,
      content: '<p>Admin-owned workshop submission.</p>',
      content_format: 'html'
    });
    const ownWorkshopSubmission = await callRestrictedRestAllowed(contract, 'create_workshop_submission', {
      course_id: courseId,
      module_id: workshop.course_module_id,
      title: `MoodlIA Student Workshop Submission ${suffix}`,
      content: '<p>Student-owned workshop submission.</p>',
      content_format: 'html'
    }, restrictedToken);
    assert.equal(ownWorkshopSubmission.module_id, workshop.course_module_id);

    const updatedOwnWorkshopSubmission = await callRestrictedRestAllowed(contract, 'update_workshop_submission', {
      course_id: courseId,
      module_id: workshop.course_module_id,
      submission_id: ownWorkshopSubmission.submission_id,
      title: `MoodlIA Student Updated Workshop Submission ${suffix}`,
      content: '<p>Student-owned updated workshop submission.</p>',
      content_format: 'html'
    }, restrictedToken);
    assert.equal(updatedOwnWorkshopSubmission.submission_id, ownWorkshopSubmission.submission_id);
    await assertRestrictedRestDenied(contract, 'update_workshop_submission', {
      course_id: courseId,
      module_id: workshop.course_module_id,
      submission_id: adminWorkshopSubmission.submission_id,
      title: `MoodlIA Forbidden Admin Workshop Submission ${suffix}`,
      content: '<p>Student must not update admin-owned workshop submissions.</p>',
      content_format: 'html'
    }, restrictedToken);

    const qbank = await callAdminRest(contract, 'create_module', {
      course_id: courseId,
      section_number: 0,
      module_type: 'qbank',
      name: `MoodlIA Student Writes QBank ${suffix}`,
      options: JSON.stringify({
        intro: '<p>Question bank used by student write smoke.</p>',
        visible: true
      })
    });
    const quiz = await callAdminRest(contract, 'create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'quiz',
      name: `MoodlIA Student Writes Quiz ${suffix}`,
      options: JSON.stringify({
        intro: '<p>Quiz used by student write smoke.</p>',
        grade: 10,
        time_open: Math.floor(Date.now() / 1000) - 60,
        time_close: Math.floor(Date.now() / 1000) + 86400,
        attempts: 1,
        preferred_behaviour: 'deferredfeedback',
        browser_security: 'none',
        visible: true
      })
    });
    const questionCategory = await callAdminRest(contract, 'create_question_category', {
      course_id: courseId,
      bank_scope: 'course_shared',
      question_bank_module_id: qbank.course_module_id,
      name: `MoodlIA Student Writes Questions ${suffix}`
    });
    const question = await callAdminRest(contract, 'create_question', {
      category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
      question_type: 'truefalse',
      name: `MoodlIA Student Writes Question ${suffix}`,
      question_text: '<p>Can the student start a quiz attempt?</p>',
      options: JSON.stringify({
        correct_answer: true
      })
    });
    await callAdminRest(contract, 'add_question_to_quiz', {
      quiz_module_id: quiz.course_module_id,
      question_id: question.question_id
    });
    const quizAttempt = await callRestrictedRestAllowed(contract, 'start_quiz_attempt', {
      quiz_module_id: quiz.course_module_id
    }, restrictedToken);
    assert.equal(quizAttempt.quiz_module_id, quiz.course_module_id);
    assert.equal(quizAttempt.attempt.user_id, restrictedUser.id);
    assert.equal(quizAttempt.attempt.state, 'inprogress');

    const attemptData = await callRestrictedRestAllowed(contract, 'get_quiz_attempt_data', {
      quiz_module_id: quiz.course_module_id,
      attempt_id: quizAttempt.attempt.attempt_id,
      page: 0
    }, restrictedToken);
    assert.equal(attemptData.attempt.attempt_id, quizAttempt.attempt.attempt_id);
    assert.ok(attemptData.questions.length > 0);

    const deletedOwnDataEntry = await callRestrictedRestAllowed(contract, 'delete_data_entry', {
      course_id: courseId,
      module_id: database.course_module_id,
      entry_id: ownDataEntry.entry_id
    }, restrictedToken);
    assert.equal(deletedOwnDataEntry.deleted, true);

    const deletedOwnGlossaryEntry = await callRestrictedRestAllowed(contract, 'delete_glossary_entry', {
      course_id: courseId,
      module_id: glossary.course_module_id,
      entry_id: ownGlossaryEntry.entry_id
    }, restrictedToken);
    assert.equal(deletedOwnGlossaryEntry.deleted, true);

    cleanupAllowed = true;
  } finally {
    if (cleanupAllowed && courseId !== null) {
      await callAdminRest(contract, 'unenrol_user', {
        course_id: courseId,
        user_id: restrictedUser.id
      });
      await callAdminRest(contract, 'delete_course', {
        course_id: courseId
      });
      courseId = null;
    }

    if (cleanupAllowed && categoryId !== null) {
      await callAdminRest(contract, 'delete_course_category', {
        category_id: categoryId
      });
      categoryId = null;
    }
  }
});
