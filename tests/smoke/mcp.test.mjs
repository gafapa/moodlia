import assert from 'node:assert/strict';
import test from 'node:test';
import { requireEnv } from '../helpers/env.mjs';
import { callMcp, callMcpHttpRaw, callMcpRaw } from '../helpers/mcp.mjs';

const hasMcpConfig = requireEnv(['MOODLE_BASE_URL', 'MOODLE_REST_TOKEN']);

async function callMcpTool(name, toolArguments = {}) {
  return callMcp('tools/call', {
    name,
    arguments: toolArguments
  });
}

test('MCP lifecycle: initialize and ping negotiate a supported protocol', { skip: !hasMcpConfig }, async () => {
  const initialized = await callMcp('initialize', {
    protocolVersion: '2025-11-25',
    capabilities: {},
    clientInfo: {
      name: 'moodlia-smoke-tests',
      version: '1.0.0'
    }
  });

  assert.equal(initialized.protocolVersion, '2025-11-25');
  assert.equal(initialized.serverInfo?.name, 'MoodlIA');
  assert.equal(initialized.capabilities?.tools?.listChanged, false);
  assert.deepEqual(await callMcp('ping'), {});
});

test('MCP lifecycle: initialized notifications return no JSON-RPC body', { skip: !hasMcpConfig }, async () => {
  const { response, body } = await callMcpHttpRaw({
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'notifications/initialized'
    })
  });

  assert.equal(response.status, 202);
  assert.equal(body, null);
});

test('MCP smoke: tools/list includes read operations', { skip: !hasMcpConfig }, async () => {
  const result = await callMcp('tools/list');
  const tools = result?.tools ?? result;
  const names = tools.map((tool) => tool.name ?? tool);

  assert.ok(names.includes('get_current_user'), 'MCP tools/list must include get_current_user.');
  assert.ok(names.includes('get_courses'), 'MCP tools/list must include get_courses.');
  assert.ok(names.includes('get_course_categories'), 'MCP tools/list must include get_course_categories.');
  assert.ok(names.includes('get_course_contents'), 'MCP tools/list must include get_course_contents.');
  assert.ok(names.includes('get_course_details'), 'MCP tools/list must include get_course_details.');
  assert.ok(names.includes('get_module_details'), 'MCP tools/list must include get_module_details.');
  assert.ok(names.includes('get_calendar_events'), 'MCP tools/list must include get_calendar_events.');
  assert.ok(names.includes('get_enrolled_users'), 'MCP tools/list must include get_enrolled_users.');
  assert.ok(names.includes('get_groups'), 'MCP tools/list must include get_groups.');
  assert.ok(names.includes('get_group_members'), 'MCP tools/list must include get_group_members.');
  assert.ok(names.includes('get_book_chapters'), 'MCP tools/list must include get_book_chapters.');
  assert.ok(names.includes('create_glossary_entry'), 'MCP tools/list must include create_glossary_entry.');
  assert.ok(names.includes('search_glossary_entries'), 'MCP tools/list must include search_glossary_entries.');
  assert.ok(names.includes('update_glossary_entry'), 'MCP tools/list must include update_glossary_entry.');
  assert.ok(names.includes('delete_glossary_entry'), 'MCP tools/list must include delete_glossary_entry.');
  assert.ok(names.includes('create_wiki_page'), 'MCP tools/list must include create_wiki_page.');
  assert.ok(names.includes('get_wiki_pages'), 'MCP tools/list must include get_wiki_pages.');
  assert.ok(names.includes('update_wiki_page'), 'MCP tools/list must include update_wiki_page.');
  assert.ok(names.includes('get_assignment_submission_status'), 'MCP tools/list must include get_assignment_submission_status.');
  assert.ok(names.includes('get_folder_files'), 'MCP tools/list must include get_folder_files.');
  assert.ok(names.includes('get_resource_files'), 'MCP tools/list must include get_resource_files.');
  assert.ok(names.includes('get_question_banks'), 'MCP tools/list must include get_question_banks.');
  assert.ok(names.includes('get_question_categories'), 'MCP tools/list must include get_question_categories.');
  assert.ok(names.includes('get_quiz_questions'), 'MCP tools/list must include get_quiz_questions.');
  assert.ok(names.includes('start_quiz_attempt'), 'MCP tools/list must include start_quiz_attempt.');
  assert.ok(names.includes('get_quiz_attempts'), 'MCP tools/list must include get_quiz_attempts.');
});

test('MCP smoke: tools/list exposes bounded enum schemas', { skip: !hasMcpConfig }, async () => {
  const result = await callMcp('tools/list');
  const tools = result?.tools ?? result;
  const createModule = tools.find((tool) => tool.name === 'create_module');
  const enrolUser = tools.find((tool) => tool.name === 'enrol_user');
  const getQuestionCategories = tools.find((tool) => tool.name === 'get_question_categories');
  const createQuestionCategory = tools.find((tool) => tool.name === 'create_question_category');
  const createQuestion = tools.find((tool) => tool.name === 'create_question');

  assert.deepEqual(createModule?.inputSchema?.properties?.module_type?.enum, ['assign', 'book', 'choice', 'data', 'feedback', 'lesson', 'lti', 'page', 'folder', 'forum', 'glossary', 'label', 'qbank', 'quiz', 'resource', 'subsection', 'url', 'wiki', 'workshop']);
  assert.deepEqual(enrolUser?.inputSchema?.properties?.role_archetype?.enum, ['student', 'teacher', 'editingteacher']);
  assert.deepEqual(getQuestionCategories?.inputSchema?.properties?.bank_scope?.enum, ['course_shared', 'quiz_private']);
  assert.deepEqual(createQuestionCategory?.inputSchema?.properties?.bank_scope?.enum, ['course_shared', 'quiz_private']);
  assert.deepEqual(createQuestion?.inputSchema?.properties?.question_type?.enum, [
    'truefalse',
    'shortanswer',
    'multichoice',
    'numerical',
    'essay',
    'matching',
    'description',
    'randomsamatch',
    'gapselect',
    'ddwtos',
    'ordering',
    'multianswer',
    'ddmarker',
    'ddimageortext',
    'calculatedsimple',
    'calculated',
    'calculatedmulti'
  ]);
});

test('MCP smoke: get_current_user responds', { skip: !hasMcpConfig }, async () => {
  const result = await callMcpTool('get_current_user');

  assert.equal(typeof result, 'object');
});

test('MCP smoke: get_courses responds', { skip: !hasMcpConfig }, async () => {
  const result = await callMcpTool('get_courses', {
    limit: 5
  });

  assert.ok(Array.isArray(result) || Array.isArray(result?.courses), 'MCP course response should include a course list.');
});

test('MCP validation: missing bearer token returns JSON-RPC error', { skip: !hasMcpConfig }, async () => {
  const { response, body } = await callMcpRaw({
    method: 'tools/list',
    includeAuthorization: false
  });

  assert.equal(response.status, 401);
  assert.equal(body.error.code, -32001);
  assert.equal(body.error.data.code, 'missing_capability');
  assert.match(body.error.message, /Missing bearer token/);
});

test('MCP validation: invalid token is rejected for tools/list', { skip: !hasMcpConfig }, async () => {
  const { response, body } = await callMcpRaw({
    method: 'tools/list',
    token: 'invalid-token-for-moodlia-tests'
  });

  assert.equal(response.status, 200);
  assert.equal(body.error.code, -32005);
  assert.ok(['invalid_parameters', 'missing_capability', 'moodle_error'].includes(body.error.data.code));
  assert.match(body.error.message, /token|access|acceso|servicio|service/i);
});

test('MCP validation: unknown methods return JSON-RPC error', { skip: !hasMcpConfig }, async () => {
  const { response, body } = await callMcpRaw({
    method: 'unknown/method'
  });

  assert.equal(response.status, 200);
  assert.equal(body.error.code, -32601);
  assert.equal(body.error.data.code, 'invalid_parameters');
  assert.equal(body.error.data.details.method, 'unknown/method');
  assert.match(body.error.message, /Unknown method: unknown\/method/);
});

test('MCP validation: unknown tools return JSON-RPC error', { skip: !hasMcpConfig }, async () => {
  const { response, body } = await callMcpRaw({
    method: 'tools/call',
    params: {
      name: 'unknown_tool',
      arguments: {}
    }
  });

  assert.equal(response.status, 200);
  assert.equal(body.error.code, -32601);
  assert.equal(body.error.data.code, 'invalid_parameters');
  assert.equal(body.error.data.details.tool, 'unknown_tool');
  assert.match(body.error.message, /Unknown tool: unknown_tool/);
});

test('MCP validation: invalid tool arguments return JSON-RPC error', { skip: !hasMcpConfig }, async () => {
  const { response, body } = await callMcpRaw({
    method: 'tools/call',
    params: {
      name: 'get_courses',
      arguments: 'invalid-arguments'
    }
  });

  assert.equal(response.status, 200);
  assert.equal(body.error.code, -32602);
  assert.equal(body.error.data.code, 'invalid_parameters');
  assert.match(body.error.message, /Tool arguments must be an object/);
});

test('MCP validation: non-POST requests return JSON-RPC error', { skip: !hasMcpConfig }, async () => {
  const { response, body } = await callMcpHttpRaw({
    method: 'GET'
  });

  assert.equal(response.status, 405);
  assert.equal(body.error.code, -32600);
  assert.equal(body.error.data.code, 'invalid_parameters');
  assert.match(body.error.message, /Only POST requests are supported/);
});

test('MCP HTTP security: content type and browser origin are validated', { skip: !hasMcpConfig }, async () => {
  const invalidContentType = await callMcpHttpRaw({
    body: JSON.stringify({ jsonrpc: '2.0', id: 'invalid-content-type', method: 'ping' }),
    contentType: 'text/plain'
  });
  assert.equal(invalidContentType.response.status, 415);
  assert.match(invalidContentType.body.error.message, /Content-Type/);

  const invalidOrigin = await callMcpHttpRaw({
    body: JSON.stringify({ jsonrpc: '2.0', id: 'invalid-origin', method: 'ping' }),
    origin: 'https://attacker.example'
  });
  assert.equal(invalidOrigin.response.status, 403);
  assert.match(invalidOrigin.body.error.message, /Origin/);
});

test('MCP validation: malformed JSON returns JSON-RPC parse error', { skip: !hasMcpConfig }, async () => {
  const { response, body } = await callMcpHttpRaw({
    body: '{"jsonrpc":"2.0",'
  });

  assert.equal(response.status, 200);
  assert.equal(body.error.code, -32700);
  assert.equal(body.error.data.code, 'invalid_parameters');
  assert.match(body.error.message, /Invalid JSON request/);
});

test('MCP validation: invalid JSON-RPC envelopes return JSON-RPC error', { skip: !hasMcpConfig }, async () => {
  const { response, body } = await callMcpHttpRaw({
    body: JSON.stringify({
      id: 'invalid-envelope',
      method: 'tools/list',
      params: {}
    })
  });

  assert.equal(response.status, 200);
  assert.equal(body.id, 'invalid-envelope');
  assert.equal(body.error.code, -32600);
  assert.equal(body.error.data.code, 'invalid_parameters');
  assert.match(body.error.message, /Invalid JSON-RPC request/);
});

test('MCP generated course, file, question, and quiz lifecycle works', { skip: !hasMcpConfig }, async () => {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const courseCategoryName = `MoodlIA MCP Course Category ${suffix}`;
  const updatedCourseCategoryName = `MoodlIA MCP Updated Course Category ${suffix}`;
  const courseName = `MoodlIA MCP Course ${suffix}`;
  const courseShortname = `moodlia-mcp-${suffix}`;
  const updatedCourseName = `MoodlIA MCP Updated Course ${suffix}`;
  const courseSummary = `<p>MoodlIA MCP course summary ${suffix}</p>`;
  const updatedCourseSummary = `<p>MoodlIA MCP updated course summary ${suffix}</p>`;
  const eventName = `MoodlIA MCP Calendar Event ${suffix}`;
  const updatedEventName = `MoodlIA MCP Updated Calendar Event ${suffix}`;
  const eventDescription = `MoodlIA MCP calendar description ${suffix}`;
  const updatedEventDescription = `MoodlIA MCP updated calendar description ${suffix}`;
  const eventStart = Math.floor(Date.now() / 1000) + 86400;
  const updatedEventStart = eventStart + 3600;
  const courseStart = eventStart - 86400;
  const courseEnd = eventStart + 604800;
  const updatedCourseEnd = eventStart + 1209600;
  const groupName = `MoodlIA MCP Group ${suffix}`;
  const updatedGroupName = `MoodlIA MCP Updated Group ${suffix}`;
  const groupingName = `MoodlIA MCP Grouping ${suffix}`;
  const updatedGroupingName = `MoodlIA MCP Updated Grouping ${suffix}`;
  const groupingDescription = `MoodlIA MCP grouping description ${suffix}`;
  const updatedGroupingDescription = `MoodlIA MCP updated grouping description ${suffix}`;
  const sectionName = `MoodlIA MCP Section ${suffix}`;
  const updatedSectionName = `MoodlIA MCP Updated Section ${suffix}`;
  const pageName = `MoodlIA MCP Page ${suffix}`;
  const updatedPageName = `MoodlIA MCP Updated Page ${suffix}`;
  const duplicatedPageName = `MoodlIA MCP Duplicated Page ${suffix}`;
  const assignName = `MoodlIA MCP Assignment ${suffix}`;
  const updatedAssignName = `MoodlIA MCP Updated Assignment ${suffix}`;
  const assignIntro = `MoodlIA MCP assignment intro ${suffix}`;
  const assignmentSubmissionText = `MoodlIA MCP assignment submission ${suffix}`;
  const assignmentGrade = 86.5;
  const assignmentFeedbackComment = `MoodlIA MCP assignment feedback ${suffix}`;
  const bookName = `MoodlIA MCP Book ${suffix}`;
  const labelName = `MoodlIA MCP Label ${suffix}`;
  const labelText = `MoodlIA MCP label content ${suffix}`;
  const urlName = `MoodlIA MCP URL ${suffix}`;
  const updatedUrlName = `MoodlIA MCP Updated URL ${suffix}`;
  const externalUrl = `https://example.com/moodlia-mcp-${suffix}`;
  const forumName = `MoodlIA MCP Forum ${suffix}`;
  const updatedForumName = `MoodlIA MCP Updated Forum ${suffix}`;
  const forumIntro = `MoodlIA MCP forum intro ${suffix}`;
  const forumDiscussionName = `MoodlIA MCP Discussion ${suffix}`;
  const forumDiscussionMessage = `<p>MoodlIA MCP discussion message ${suffix}</p>`;
  const forumReplySubject = `MoodlIA MCP Reply ${suffix}`;
  const forumReplyMessage = `<p>MoodlIA MCP reply message ${suffix}</p>`;
  const updatedForumReplySubject = `MoodlIA MCP Updated Reply ${suffix}`;
  const updatedForumReplyMessage = `<p>MoodlIA MCP updated reply message ${suffix}</p>`;
  const glossaryName = `MoodlIA MCP Glossary ${suffix}`;
  const glossaryConcept = `MoodlIA MCP Concept ${suffix}`;
  const updatedGlossaryConcept = `MoodlIA MCP Updated Concept ${suffix}`;
  const glossaryDefinition = `<p>MoodlIA MCP glossary definition ${suffix}</p>`;
  const updatedGlossaryDefinition = `<p>MoodlIA MCP updated glossary definition ${suffix}</p>`;
  const wikiName = `MoodlIA MCP Wiki ${suffix}`;
  const wikiFirstPage = `MoodlIA MCP Wiki Home ${suffix}`;
  const wikiPageTitle = `MoodlIA MCP Wiki Page ${suffix}`;
  const wikiPageContent = `<h3>MoodlIA MCP wiki page ${suffix}</h3><p>Initial generated wiki content.</p>`;
  const updatedWikiPageContent = `<h3>MoodlIA MCP updated wiki page ${suffix}</h3><p>Updated generated wiki content.</p>`;
  const folderName = `MoodlIA MCP Folder ${suffix}`;
  const filename = `moodlia-mcp-${suffix}.txt`;
  const categoryName = `MoodlIA MCP Questions ${suffix}`;
  const updatedCategoryName = `MoodlIA MCP Updated Questions ${suffix}`;
  const emptyCategoryName = `MoodlIA MCP Empty Questions ${suffix}`;
  const moveTargetCategoryName = `MoodlIA MCP Move Target Questions ${suffix}`;
  const privateCategoryName = `MoodlIA MCP Private Questions ${suffix}`;
  const questionName = `MoodlIA MCP True False ${suffix}`;
  const updatedQuestionName = `MoodlIA MCP Updated True False ${suffix}`;
  const movableQuestionName = `MoodlIA MCP Movable Question ${suffix}`;
  const shortAnswerName = `MoodlIA MCP Short Answer ${suffix}`;
  const updatedShortAnswerName = `MoodlIA MCP Updated Short Answer ${suffix}`;
  const multichoiceName = `MoodlIA MCP Multichoice ${suffix}`;
  const updatedMultichoiceName = `MoodlIA MCP Updated Multichoice ${suffix}`;
  const numericalName = `MoodlIA MCP Numerical ${suffix}`;
  const updatedNumericalName = `MoodlIA MCP Updated Numerical ${suffix}`;
  const matchingName = `MoodlIA MCP Matching ${suffix}`;
  const updatedMatchingName = `MoodlIA MCP Updated Matching ${suffix}`;
  const essayName = `MoodlIA MCP Essay ${suffix}`;
  const updatedEssayName = `MoodlIA MCP Updated Essay ${suffix}`;
  const deletedQuestionName = `MoodlIA MCP Deleted Question ${suffix}`;
  const privateQuestionName = `MoodlIA MCP Private True False ${suffix}`;
  const removableQuizQuestionName = `MoodlIA MCP Removable Quiz Question ${suffix}`;
  const quizName = `MoodlIA MCP Quiz ${suffix}`;
  let courseId = null;
  let courseCategoryId = null;
  let calendarEventId = null;
  let userUnenrolled = false;
  let groupMemberRemoved = false;
  let groupRemovedFromGrouping = false;
  let groupingDeleted = false;
  let groupDeleted = false;
  let pageDeleted = false;
  let duplicatedPageDeleted = false;
  let assignDeleted = false;
  let bookDeleted = false;
  let labelDeleted = false;
  let urlDeleted = false;
  let forumDeleted = false;
  let glossaryDeleted = false;
  let glossaryEntryDeleted = false;
  let wikiDeleted = false;
  let folderDeleted = false;
  let fileDeleted = false;
  let emptyCategoryDeleted = false;
  let quizDeleted = false;
  let sectionDeleted = false;
  let courseCategoryDeleted = false;
  let calendarEventDeleted = false;

  try {
    const createdCourseCategory = await callMcpTool('create_course_category', {
      name: courseCategoryName,
      visible: true
    });

    assert.equal(createdCourseCategory.name, courseCategoryName);
    assert.equal(createdCourseCategory.visible, true);
    assert.equal(typeof createdCourseCategory.category_id, 'number');
    courseCategoryId = createdCourseCategory.category_id;

    const updatedCourseCategory = await callMcpTool('update_course_category', {
      category_id: courseCategoryId,
      name: updatedCourseCategoryName,
      visible: true
    });

    assert.equal(updatedCourseCategory.category_id, courseCategoryId);
    assert.equal(updatedCourseCategory.name, updatedCourseCategoryName);

    const listedCourseCategories = await callMcpTool('get_course_categories', {
      parent_id: -1
    });
    assert.ok(
      listedCourseCategories.categories.some((category) =>
        category.category_id === courseCategoryId &&
        category.name === updatedCourseCategoryName
      ),
      'MCP get_course_categories must list the created category'
    );

    const createdCourse = await callMcpTool('create_course', {
      fullname: courseName,
      shortname: courseShortname,
      category_id: courseCategoryId,
      visible: false,
      summary: courseSummary,
      summary_format: 'html',
      course_format: 'topics',
      start_date: courseStart,
      end_date: courseEnd
    });

    assert.equal(createdCourse.fullname, courseName);
    assert.equal(createdCourse.shortname, courseShortname);
    assert.equal(createdCourse.category_id, courseCategoryId);
    assert.equal(createdCourse.summary_format, 'html');
    assert.equal(createdCourse.format, 'topics');
    assert.equal(createdCourse.start_date, courseStart);
    assert.equal(createdCourse.end_date, courseEnd);
    assert.match(createdCourse.summary, /MoodlIA MCP course summary/);
    assert.equal(typeof createdCourse.course_id, 'number');
    courseId = createdCourse.course_id;

    const updatedCourse = await callMcpTool('update_course', {
      course_id: courseId,
      fullname: updatedCourseName,
      visible: false,
      summary: updatedCourseSummary,
      summary_format: 'html',
      course_format: 'topics',
      end_date: updatedCourseEnd
    });

    assert.equal(updatedCourse.course_id, courseId);
    assert.equal(updatedCourse.fullname, updatedCourseName);
    assert.equal(updatedCourse.summary_format, 'html');
    assert.equal(updatedCourse.format, 'topics');
    assert.equal(updatedCourse.start_date, courseStart);
    assert.equal(updatedCourse.end_date, updatedCourseEnd);
    assert.match(updatedCourse.summary, /MoodlIA MCP updated course summary/);

    const courseDetails = await callMcpTool('get_course_details', {
      course_id: courseId
    });

    assert.equal(courseDetails.course_id, courseId);
    assert.equal(courseDetails.fullname, updatedCourseName);
    assert.equal(courseDetails.category_id, courseCategoryId);
    assert.equal(courseDetails.visible, false);
    assert.equal(courseDetails.summary_format, 'html');
    assert.equal(courseDetails.format, 'topics');
    assert.equal(courseDetails.start_date, courseStart);
    assert.equal(courseDetails.end_date, updatedCourseEnd);
    assert.match(courseDetails.summary, /MoodlIA MCP updated course summary/);

    const createdCalendarEvent = await callMcpTool('create_calendar_event', {
      course_id: courseId,
      name: eventName,
      timestart: eventStart,
      description: eventDescription,
      timeduration: 1800
    });

    assert.equal(createdCalendarEvent.course_id, courseId);
    assert.equal(createdCalendarEvent.name, eventName);
    assert.equal(createdCalendarEvent.event_type, 'course');
    assert.equal(createdCalendarEvent.timestart, eventStart);
    assert.equal(createdCalendarEvent.timeduration, 1800);
    assert.equal(typeof createdCalendarEvent.event_id, 'number');
    calendarEventId = createdCalendarEvent.event_id;

    const listedCalendarEvents = await callMcpTool('get_calendar_events', {
      course_id: courseId,
      time_from: eventStart - 3600,
      time_to: eventStart + 7200
    });
    assert.ok(
      listedCalendarEvents.events.some((event) =>
        event.event_id === calendarEventId &&
        event.name === eventName
      ),
      'MCP get_calendar_events must list the created event'
    );

    const updatedCalendarEvent = await callMcpTool('update_calendar_event', {
      course_id: courseId,
      event_id: calendarEventId,
      name: updatedEventName,
      description: updatedEventDescription,
      timestart: updatedEventStart,
      timeduration: 2700
    });

    assert.equal(updatedCalendarEvent.event_id, calendarEventId);
    assert.equal(updatedCalendarEvent.name, updatedEventName);
    assert.equal(updatedCalendarEvent.timestart, updatedEventStart);
    assert.equal(updatedCalendarEvent.timeduration, 2700);

    const currentUser = await callMcpTool('get_current_user');
    assert.equal(typeof currentUser.id, 'number');

    const enrolledUser = await callMcpTool('enrol_user', {
      course_id: courseId,
      user_id: currentUser.id,
      role_archetype: 'student'
    });

    assert.equal(enrolledUser.course_id, courseId);
    assert.equal(enrolledUser.user_id, currentUser.id);
    assert.equal(enrolledUser.role_archetype, 'student');
    assert.equal(enrolledUser.enrolled, true);
    assert.ok(enrolledUser.user.roles.includes('student'), 'MCP enrol_user must assign the student role');

    const enrolledUsers = await callMcpTool('get_enrolled_users', {
      course_id: courseId
    });
    assert.ok(
      enrolledUsers.users.some((user) =>
        user.user_id === currentUser.id &&
        user.username === currentUser.username &&
        user.roles.includes('student')
      ),
      'MCP get_enrolled_users must list the enrolled current user'
    );

    const createdGroup = await callMcpTool('create_group', {
      course_id: courseId,
      name: groupName,
      description: `MoodlIA MCP group description ${suffix}`
    });

    assert.equal(createdGroup.course_id, courseId);
    assert.equal(createdGroup.name, groupName);
    assert.equal(typeof createdGroup.group_id, 'number');

    const listedGroups = await callMcpTool('get_groups', {
      course_id: courseId
    });
    assert.ok(
      listedGroups.groups.some((group) => group.group_id === createdGroup.group_id && group.name === groupName),
      'MCP get_groups must list the created group'
    );

    const createdGrouping = await callMcpTool('create_grouping', {
      course_id: courseId,
      name: groupingName,
      description: groupingDescription
    });

    assert.equal(createdGrouping.course_id, courseId);
    assert.equal(createdGrouping.name, groupingName);
    assert.equal(typeof createdGrouping.grouping_id, 'number');

    const listedGroupings = await callMcpTool('get_groupings', {
      course_id: courseId
    });
    assert.ok(
      listedGroupings.groupings.some((grouping) =>
        grouping.grouping_id === createdGrouping.grouping_id &&
        grouping.name === groupingName
      ),
      'MCP get_groupings must list the created grouping'
    );

    const addedGroupToGrouping = await callMcpTool('add_group_to_grouping', {
      course_id: courseId,
      grouping_id: createdGrouping.grouping_id,
      group_id: createdGroup.group_id
    });

    assert.equal(addedGroupToGrouping.added, true);
    assert.equal(addedGroupToGrouping.grouping.name, groupingName);
    assert.equal(addedGroupToGrouping.group.name, groupName);

    const updatedGrouping = await callMcpTool('update_grouping', {
      course_id: courseId,
      grouping_id: createdGrouping.grouping_id,
      name: updatedGroupingName,
      description: updatedGroupingDescription
    });

    assert.equal(updatedGrouping.grouping_id, createdGrouping.grouping_id);
    assert.equal(updatedGrouping.name, updatedGroupingName);
    assert.equal(updatedGrouping.description, updatedGroupingDescription);

    const removedGroupFromGrouping = await callMcpTool('remove_group_from_grouping', {
      course_id: courseId,
      grouping_id: createdGrouping.grouping_id,
      group_id: createdGroup.group_id
    });

    assert.equal(removedGroupFromGrouping.removed, true);
    groupRemovedFromGrouping = true;

    const deletedGrouping = await callMcpTool('delete_grouping', {
      course_id: courseId,
      grouping_id: createdGrouping.grouping_id
    });

    assert.equal(deletedGrouping.deleted, true);
    assert.equal(deletedGrouping.id, createdGrouping.grouping_id);
    groupingDeleted = true;

    const addedGroupMember = await callMcpTool('add_group_member', {
      course_id: courseId,
      group_id: createdGroup.group_id,
      user_id: currentUser.id
    });

    assert.equal(addedGroupMember.added, true);
    assert.equal(addedGroupMember.user_id, currentUser.id);

    const listedGroupMembers = await callMcpTool('get_group_members', {
      course_id: courseId,
      group_id: createdGroup.group_id
    });
    assert.ok(
      listedGroupMembers.members.some((member) =>
        member.user_id === currentUser.id &&
        member.username === currentUser.username
      ),
      'MCP get_group_members must list the added current user'
    );

    const removedGroupMember = await callMcpTool('remove_group_member', {
      course_id: courseId,
      group_id: createdGroup.group_id,
      user_id: currentUser.id
    });

    assert.equal(removedGroupMember.removed, true);
    groupMemberRemoved = true;

    const updatedGroup = await callMcpTool('update_group', {
      course_id: courseId,
      group_id: createdGroup.group_id,
      name: updatedGroupName
    });

    assert.equal(updatedGroup.group_id, createdGroup.group_id);
    assert.equal(updatedGroup.name, updatedGroupName);

    const deletedGroup = await callMcpTool('delete_group', {
      course_id: courseId,
      group_id: createdGroup.group_id
    });

    assert.equal(deletedGroup.deleted, true);
    assert.equal(deletedGroup.id, createdGroup.group_id);
    groupDeleted = true;

    const unenrolledUser = await callMcpTool('unenrol_user', {
      course_id: courseId,
      user_id: currentUser.id
    });

    assert.equal(unenrolledUser.course_id, courseId);
    assert.equal(unenrolledUser.user_id, currentUser.id);
    assert.equal(unenrolledUser.unenrolled, true);
    userUnenrolled = true;

    const createdSection = await callMcpTool('create_section', {
      course_id: courseId,
      name: sectionName,
      summary: 'Created by MoodlIA MCP automated tests.'
    });

    assert.equal(createdSection.course_id, courseId);
    assert.equal(createdSection.name, sectionName);
    assert.equal(typeof createdSection.section_id, 'number');
    assert.equal(typeof createdSection.section_number, 'number');
    assert.equal(createdSection.visible, true);
    assert.match(createdSection.summary, /Created by MoodlIA MCP automated tests\./);

    const updatedSection = await callMcpTool('update_section', {
      course_id: courseId,
      section_id: createdSection.section_id,
      name: updatedSectionName,
      summary: 'Updated by MoodlIA MCP automated tests.',
      visible: false
    });

    assert.equal(updatedSection.section_id, createdSection.section_id);
    assert.equal(updatedSection.name, updatedSectionName);
    assert.equal(updatedSection.visible, false);
    assert.match(updatedSection.summary, /Updated by MoodlIA MCP automated tests\./);

    const reshownSection = await callMcpTool('update_section', {
      course_id: courseId,
      section_id: createdSection.section_id,
      visible: true
    });

    assert.equal(reshownSection.section_id, createdSection.section_id);
    assert.equal(reshownSection.visible, true);

    const createdPage = await callMcpTool('create_module', {
      course_id: courseId,
      section_number: createdSection.section_number,
      module_type: 'page',
      name: pageName,
      options: {
        content: '<p>Created by MoodlIA MCP automated tests.</p>',
        visible: true,
        visible_on_course_page: false,
        id_number: `moodlia-mcp-${suffix.toLowerCase()}`,
        language: 'en',
        group_mode: 'none',
        download_content: false,
        print_intro: true,
        print_last_modified: false
      }
    });

    assert.equal(createdPage.module_type, 'page');
    assert.equal(createdPage.name, pageName);
    assert.equal(createdPage.visible, true);
    assert.equal(typeof createdPage.visible_on_course_page, 'boolean');
    assert.equal(createdPage.download_content, false);
    assert.equal(createdPage.id_number, `moodlia-mcp-${suffix.toLowerCase()}`);
    assert.equal(createdPage.language, 'en');
    assert.equal(createdPage.group_mode, 0);
    assert.equal(typeof createdPage.course_module_id, 'number');

    const pageDetails = await callMcpTool('get_module_details', {
      course_id: courseId,
      module_id: createdPage.course_module_id
    });

    assert.equal(pageDetails.course_module_id, createdPage.course_module_id);
    assert.equal(pageDetails.instance_id, createdPage.instance_id);
    assert.equal(pageDetails.module_type, 'page');
    assert.equal(pageDetails.name, pageName);
    assert.equal(pageDetails.section_number, createdSection.section_number);
    assert.equal(pageDetails.visible, true);
    assert.equal(pageDetails.visible_on_course_page, createdPage.visible_on_course_page);
    assert.equal(pageDetails.download_content, false);
    assert.equal(pageDetails.id_number, `moodlia-mcp-${suffix.toLowerCase()}`);
    const pageExtra = JSON.parse(pageDetails.extra_json);
    assert.equal(pageExtra.activity.page_id, createdPage.instance_id);
    assert.ok(
      pageExtra.activity.content.includes('Created by MoodlIA MCP automated tests.'),
      'MCP page details must expose rendered page content'
    );
    assert.ok(pageExtra.activity.content_length > 0, 'MCP page details must expose content length');

    const updatedPage = await callMcpTool('update_module', {
      course_id: courseId,
      module_id: createdPage.course_module_id,
      name: updatedPageName,
      visible: false,
      options: {
        id_number: `moodlia-mcp-updated-${suffix.toLowerCase()}`,
        tags: [`moodlia-mcp-updated-${suffix.toLowerCase()}`],
        download_content: true
      }
    });

    assert.equal(updatedPage.course_module_id, createdPage.course_module_id);
    assert.equal(updatedPage.name, updatedPageName);
    assert.equal(updatedPage.visible, false);
    assert.equal(updatedPage.visible_on_course_page, createdPage.visible_on_course_page);
    assert.equal(updatedPage.download_content, true);
    assert.equal(updatedPage.id_number, `moodlia-mcp-updated-${suffix.toLowerCase()}`);

    const hiddenCourseContents = await callMcpTool('get_course_contents', {
      course_id: courseId
    });
    const hiddenPage = hiddenCourseContents.sections
      .flatMap((section) => section.modules)
      .find((module) => module.course_module_id === createdPage.course_module_id);
    assert.equal(hiddenPage.visible, false);
    assert.equal(hiddenPage.visible_on_course_page, updatedPage.visible_on_course_page);

    const reshownPage = await callMcpTool('update_module', {
      course_id: courseId,
      module_id: createdPage.course_module_id,
      visible: true
    });
    assert.equal(reshownPage.visible, true);
    assert.equal(reshownPage.visible_on_course_page, hiddenPage.visible_on_course_page);

    const coursePagePage = await callMcpTool('update_module', {
      course_id: courseId,
      module_id: createdPage.course_module_id,
      options: {
        visible_on_course_page: true
      }
    });
    assert.equal(coursePagePage.visible, true);
    assert.equal(coursePagePage.visible_on_course_page, true);

    const duplicatedPage = await callMcpTool('duplicate_module', {
      course_id: courseId,
      module_id: createdPage.course_module_id,
      section_number: createdSection.section_number,
      name: duplicatedPageName
    });

    assert.notEqual(duplicatedPage.course_module_id, createdPage.course_module_id);
    assert.equal(duplicatedPage.module_type, 'page');
    assert.equal(duplicatedPage.name, duplicatedPageName);
    assert.match(duplicatedPage.url, /\/mod\/page\/view\.php\?id=/);

    const movedDuplicatedPage = await callMcpTool('move_module', {
      course_id: courseId,
      module_id: duplicatedPage.course_module_id,
      section_number: 0
    });

    assert.equal(movedDuplicatedPage.course_module_id, duplicatedPage.course_module_id);
    assert.equal(movedDuplicatedPage.name, duplicatedPageName);

    const courseContentsWithMovedDuplicate = await callMcpTool('get_course_contents', {
      course_id: courseId
    });
    const generalSectionWithMovedDuplicate = courseContentsWithMovedDuplicate.sections
      .find((section) => section.section_number === 0);
    const duplicatedContentPage = generalSectionWithMovedDuplicate?.modules
      .find((module) => module.course_module_id === duplicatedPage.course_module_id);
    assert.equal(duplicatedContentPage?.name, duplicatedPageName);

    const deletedDuplicatedPage = await callMcpTool('delete_module', {
      course_id: courseId,
      module_id: duplicatedPage.course_module_id
    });

    assert.equal(deletedDuplicatedPage.deleted, true);
    assert.equal(deletedDuplicatedPage.id, duplicatedPage.course_module_id);
    duplicatedPageDeleted = true;

    const deletedPage = await callMcpTool('delete_module', {
      course_id: courseId,
      module_id: createdPage.course_module_id
    });

    assert.equal(deletedPage.deleted, true);
    assert.equal(deletedPage.id, createdPage.course_module_id);
    pageDeleted = true;

    const createdAssign = await callMcpTool('create_module', {
      course_id: courseId,
      section_number: createdSection.section_number,
      module_type: 'assign',
      name: assignName,
      options: {
        intro: `<p>${assignIntro}</p>`,
        activity: `<p>MCP assignment instructions ${suffix}</p>`,
        online_text: true,
        file_submissions: false,
        submission_attachments: false,
        submission_drafts: true,
        require_submission_statement: false,
        send_notifications: false,
        send_late_notifications: false,
        send_student_notifications: false,
        allow_submissions_from_date: Math.floor(Date.now() / 1000) - 60,
        due_date: Math.floor(Date.now() / 1000) + 86400,
        cutoff_date: Math.floor(Date.now() / 1000) + 172800,
        grading_due_date: Math.floor(Date.now() / 1000) + 259200,
        grade: 100,
        team_submission: false,
        blind_marking: false,
        hide_grader: false,
        max_attempts: 2,
        attempt_reopen_method: 'manual',
        marking_workflow: false,
        feedback_comments: true,
        feedback_comment_inline: false,
        feedback_offline: false,
        feedback_files: false,
        feedback_editpdf: false
      }
    });

    assert.equal(createdAssign.module_type, 'assign');
    assert.equal(createdAssign.name, assignName);
    assert.equal(typeof createdAssign.course_module_id, 'number');
    assert.match(createdAssign.url, /\/mod\/assign\/view\.php\?id=/);

    const assignDetails = await callMcpTool('get_module_details', {
      course_id: courseId,
      module_id: createdAssign.course_module_id
    });
    const assignExtra = JSON.parse(assignDetails.extra_json);
    assert.equal(assignDetails.module_type, 'assign');
    assert.equal(assignDetails.course_module_id, createdAssign.course_module_id);
    assert.equal(assignExtra.activity.assignment_id, createdAssign.instance_id);
    assert.equal(assignExtra.activity.duedate > assignExtra.activity.allowsubmissionsfromdate, true);
    assert.equal(assignExtra.activity.cutoffdate >= assignExtra.activity.duedate, true);
    assert.equal(assignExtra.activity.grade, 100);
    assert.equal(assignExtra.activity.submissiondrafts, true);
    assert.equal(assignExtra.activity.maxattempts, 2);
    assert.ok(assignExtra.activity.submission_plugins.includes('onlinetext'));
    assert.ok(assignExtra.activity.feedback_plugins.includes('comments'));

    const updatedAssign = await callMcpTool('update_module', {
      course_id: courseId,
      module_id: createdAssign.course_module_id,
      name: updatedAssignName,
      options: {
        group_mode: 'visible_groups'
      }
    });

    assert.equal(updatedAssign.course_module_id, createdAssign.course_module_id);
    assert.equal(updatedAssign.name, updatedAssignName);
    assert.equal(updatedAssign.group_mode, 2);

    const assignmentSubmitter = await callMcpTool('enrol_user', {
      course_id: courseId,
      user_id: currentUser.id,
      role_archetype: 'student'
    });
    assert.equal(assignmentSubmitter.enrolled, true);
    userUnenrolled = false;

    const savedAssignmentSubmission = await callMcpTool('save_assignment_submission', {
      course_id: courseId,
      module_id: createdAssign.course_module_id,
      online_text: `<p>${assignmentSubmissionText}</p>`
    });
    assert.equal(savedAssignmentSubmission.course_id, courseId);
    assert.equal(savedAssignmentSubmission.module_id, createdAssign.course_module_id);
    assert.equal(savedAssignmentSubmission.assignment_id, createdAssign.instance_id);
    assert.equal(savedAssignmentSubmission.submitted, false);
    assert.match(savedAssignmentSubmission.online_text, new RegExp(assignmentSubmissionText));

    const listedAssignmentSubmission = await callMcpTool('get_assignment_submission_status', {
      course_id: courseId,
      module_id: createdAssign.course_module_id
    });
    assert.equal(listedAssignmentSubmission.submission_id, savedAssignmentSubmission.submission_id);
    assert.match(listedAssignmentSubmission.online_text, new RegExp(assignmentSubmissionText));

    const submittedAssignment = await callMcpTool('submit_assignment_for_grading', {
      course_id: courseId,
      module_id: createdAssign.course_module_id,
      accept_submission_statement: true
    });
    assert.equal(submittedAssignment.submitted, true);
    assert.equal(submittedAssignment.status, 'submitted');
    assert.match(submittedAssignment.online_text, new RegExp(assignmentSubmissionText));

    const gradedAssignment = await callMcpTool('save_assignment_grade', {
      course_id: courseId,
      module_id: createdAssign.course_module_id,
      user_id: currentUser.id,
      grade: assignmentGrade,
      feedback_comment: `<p>${assignmentFeedbackComment}</p>`
    });
    assert.equal(gradedAssignment.submitted, true);
    assert.equal(gradedAssignment.graded, true);
    assert.equal(gradedAssignment.grade, assignmentGrade);
    assert.equal(gradedAssignment.grader_id, currentUser.id);
    assert.match(gradedAssignment.feedback_comment, new RegExp(assignmentFeedbackComment));

    const gradeItems = await callMcpTool('get_grade_items', {
      course_id: courseId
    });
    assert.ok(
      gradeItems.items.some((item) => item.name === updatedAssignName),
      'MCP gradebook items should include the generated assignment.'
    );

    const userGrades = await callMcpTool('get_user_grades', {
      course_id: courseId,
      user_id: currentUser.id
    });
    assert.equal(userGrades.user_id, currentUser.id);
    const assignmentGradeItem = userGrades.items.find((item) => item.course_module_id === createdAssign.course_module_id);
    assert.ok(assignmentGradeItem, 'MCP user grades should include the generated assignment grade item.');
    assert.equal(assignmentGradeItem.name, updatedAssignName);
    assert.equal(assignmentGradeItem.grade_raw, assignmentGrade);

    const assignmentUserCleanup = await callMcpTool('unenrol_user', {
      course_id: courseId,
      user_id: currentUser.id
    });
    assert.equal(assignmentUserCleanup.unenrolled, true);
    userUnenrolled = true;

    const deletedAssign = await callMcpTool('delete_module', {
      course_id: courseId,
      module_id: createdAssign.course_module_id
    });

    assert.equal(deletedAssign.deleted, true);
    assert.equal(deletedAssign.id, createdAssign.course_module_id);
    assignDeleted = true;

    const createdBook = await callMcpTool('create_module', {
      course_id: courseId,
      section_number: createdSection.section_number,
      module_type: 'book',
      name: bookName,
      options: {
        intro: '<p>Created by MoodlIA MCP lifecycle tests.</p>',
        numbering: 'indented',
        custom_titles: false
      }
    });

    assert.equal(createdBook.module_type, 'book');
    assert.equal(createdBook.name, bookName);
    assert.equal(typeof createdBook.course_module_id, 'number');
    assert.match(createdBook.url, /\/mod\/book\/view\.php\?id=/);

    const listedBookChapters = await callMcpTool('get_book_chapters', {
      course_id: courseId,
      module_id: createdBook.course_module_id,
      include_content: false
    });

    assert.equal(listedBookChapters.module_id, createdBook.course_module_id);
    assert.equal(listedBookChapters.book_id, createdBook.instance_id);
    assert.equal(listedBookChapters.count, listedBookChapters.chapters.length);

    const viewedBook = await callMcpTool('view_book', {
      course_id: courseId,
      module_id: createdBook.course_module_id
    });

    assert.equal(viewedBook.module_id, createdBook.course_module_id);
    assert.equal(viewedBook.book_id, createdBook.instance_id);
    assert.equal(viewedBook.viewed, true);
    assert.equal(Array.isArray(viewedBook.warnings), true);

    const bookDetails = await callMcpTool('get_module_details', {
      course_id: courseId,
      module_id: createdBook.course_module_id
    });
    const bookExtra = JSON.parse(bookDetails.extra_json);
    assert.equal(bookDetails.module_type, 'book');
    assert.equal(bookExtra.activity.book_id, createdBook.instance_id);
    assert.equal(bookExtra.activity.chapter_count, listedBookChapters.count);
    assert.equal(Array.isArray(bookExtra.activity.chapters), true);

    const deletedBook = await callMcpTool('delete_module', {
      course_id: courseId,
      module_id: createdBook.course_module_id
    });

    assert.equal(deletedBook.deleted, true);
    assert.equal(deletedBook.id, createdBook.course_module_id);
    bookDeleted = true;

    const createdLabel = await callMcpTool('create_module', {
      course_id: courseId,
      section_number: createdSection.section_number,
      module_type: 'label',
      name: labelName,
      options: {
        content: `<p>${labelText}</p>`
      }
    });

    assert.equal(createdLabel.module_type, 'label');
    assert.equal(createdLabel.name, labelName);
    assert.equal(typeof createdLabel.course_module_id, 'number');
    assert.equal(createdLabel.url, '');

    const labelDetails = await callMcpTool('get_module_details', {
      course_id: courseId,
      module_id: createdLabel.course_module_id
    });
    const labelExtra = JSON.parse(labelDetails.extra_json);
    assert.equal(labelDetails.module_type, 'label');
    assert.equal(labelExtra.activity.label_id, createdLabel.instance_id);
    assert.ok(labelExtra.activity.content.includes(labelText), 'MCP label details must expose rendered label content');
    assert.ok(labelExtra.activity.content_length > 0, 'MCP label details must expose content length');

    const deletedLabel = await callMcpTool('delete_module', {
      course_id: courseId,
      module_id: createdLabel.course_module_id
    });

    assert.equal(deletedLabel.deleted, true);
    assert.equal(deletedLabel.id, createdLabel.course_module_id);
    labelDeleted = true;

    const createdUrl = await callMcpTool('create_module', {
      course_id: courseId,
      section_number: createdSection.section_number,
      module_type: 'url',
      name: urlName,
      options: {
        external_url: externalUrl,
        intro: '<p>Created by MoodlIA MCP lifecycle tests.</p>'
      }
    });

    assert.equal(createdUrl.module_type, 'url');
    assert.equal(createdUrl.name, urlName);
    assert.equal(typeof createdUrl.course_module_id, 'number');
    assert.match(createdUrl.url, /\/mod\/url\/view\.php\?id=/);

    const updatedUrl = await callMcpTool('update_module', {
      course_id: courseId,
      module_id: createdUrl.course_module_id,
      name: updatedUrlName
    });

    assert.equal(updatedUrl.course_module_id, createdUrl.course_module_id);
    assert.equal(updatedUrl.name, updatedUrlName);

    const urlDetails = await callMcpTool('get_module_details', {
      course_id: courseId,
      module_id: createdUrl.course_module_id
    });
    const urlExtra = JSON.parse(urlDetails.extra_json);
    assert.equal(urlDetails.module_type, 'url');
    assert.equal(urlExtra.activity.url_id, createdUrl.instance_id);
    if (urlExtra.activity.external_url !== '') {
      assert.equal(urlExtra.activity.external_url, externalUrl);
    }

    const deletedUrl = await callMcpTool('delete_module', {
      course_id: courseId,
      module_id: createdUrl.course_module_id
    });

    assert.equal(deletedUrl.deleted, true);
    assert.equal(deletedUrl.id, createdUrl.course_module_id);
    urlDeleted = true;

    const createdForum = await callMcpTool('create_module', {
      course_id: courseId,
      section_number: createdSection.section_number,
      module_type: 'forum',
      name: forumName,
      options: {
        forum_type: 'general',
        intro: `<p>${forumIntro}</p>`,
        max_bytes: 1048576,
        max_attachments: 3,
        subscription_mode: 'optional',
        tracking_type: 'optional',
        display_word_count: true,
        lock_discussion_after_seconds: 0,
        due_date: Math.floor(Date.now() / 1000) + 86400,
        cutoff_date: Math.floor(Date.now() / 1000) + 172800,
        warn_after_posts: 10,
        block_after_posts: 20,
        block_period_seconds: 86400
      }
    });

    assert.equal(createdForum.module_type, 'forum');
    assert.equal(createdForum.name, forumName);
    assert.equal(typeof createdForum.course_module_id, 'number');
    assert.match(createdForum.url, /\/mod\/forum\/view\.php\?id=/);

    const createdDiscussion = await callMcpTool('create_forum_discussion', {
      course_id: courseId,
      module_id: createdForum.course_module_id,
      name: forumDiscussionName,
      message: forumDiscussionMessage
    });

    assert.equal(createdDiscussion.course_id, courseId);
    assert.equal(createdDiscussion.module_id, createdForum.course_module_id);
    assert.equal(createdDiscussion.name, forumDiscussionName);
    assert.equal(typeof createdDiscussion.discussion_id, 'number');
    assert.equal(typeof createdDiscussion.first_post_id, 'number');

    const listedDiscussions = await callMcpTool('get_forum_discussions', {
      course_id: courseId,
      module_id: createdForum.course_module_id
    });
    assert.ok(
      listedDiscussions.discussions.some((discussion) =>
        discussion.discussion_id === createdDiscussion.discussion_id &&
        discussion.name === forumDiscussionName
      ),
      'MCP get_forum_discussions must list the created discussion'
    );

    const listedInitialPosts = await callMcpTool('get_forum_discussion_posts', {
      course_id: courseId,
      module_id: createdForum.course_module_id,
      discussion_id: createdDiscussion.discussion_id
    });
    assert.ok(
      listedInitialPosts.posts.some((post) =>
        post.post_id === createdDiscussion.first_post_id &&
        post.subject === forumDiscussionName
      ),
      'MCP get_forum_discussion_posts must include the first post'
    );

    const createdReply = await callMcpTool('create_forum_discussion_post', {
      course_id: courseId,
      module_id: createdForum.course_module_id,
      discussion_id: createdDiscussion.discussion_id,
      parent_post_id: createdDiscussion.first_post_id,
      subject: forumReplySubject,
      message: forumReplyMessage
    });

    assert.equal(createdReply.discussion_id, createdDiscussion.discussion_id);
    assert.equal(createdReply.parent_post_id, createdDiscussion.first_post_id);
    assert.equal(createdReply.subject, forumReplySubject);

    const updatedReply = await callMcpTool('update_forum_discussion_post', {
      course_id: courseId,
      module_id: createdForum.course_module_id,
      discussion_id: createdDiscussion.discussion_id,
      post_id: createdReply.post_id,
      subject: updatedForumReplySubject,
      message: updatedForumReplyMessage
    });

    assert.equal(updatedReply.post_id, createdReply.post_id);
    assert.equal(updatedReply.subject, updatedForumReplySubject);

    const listedUpdatedPosts = await callMcpTool('get_forum_discussion_posts', {
      course_id: courseId,
      module_id: createdForum.course_module_id,
      discussion_id: createdDiscussion.discussion_id
    });
    const forumDetails = await callMcpTool('get_module_details', {
      course_id: courseId,
      module_id: createdForum.course_module_id
    });
    const forumExtra = JSON.parse(forumDetails.extra_json);
    assert.equal(forumDetails.module_type, 'forum');
    assert.equal(forumDetails.course_module_id, createdForum.course_module_id);
    assert.equal(forumExtra.activity.forum_id, createdForum.instance_id);
    if (forumExtra.activity.forum_type !== '') {
      assert.equal(forumExtra.activity.forum_type, 'general');
    }
    assert.equal(forumExtra.activity.maxattachments, 3);
    assert.equal(forumExtra.activity.discussion_count, listedDiscussions.discussions.length);
    assert.equal(forumExtra.activity.total_post_count, listedUpdatedPosts.posts.length);
    assert.ok(
      forumExtra.activity.discussions.some((discussion) =>
        discussion.discussion_id === createdDiscussion.discussion_id &&
        discussion.name === forumDiscussionName &&
        discussion.reply_count >= 1
      ),
      'MCP forum module details must include the created discussion summary'
    );

    const updatedForum = await callMcpTool('update_module', {
      course_id: courseId,
      module_id: createdForum.course_module_id,
      name: updatedForumName
    });

    assert.equal(updatedForum.course_module_id, createdForum.course_module_id);
    assert.equal(updatedForum.name, updatedForumName);

    const deletedForum = await callMcpTool('delete_module', {
      course_id: courseId,
      module_id: createdForum.course_module_id
    });

    assert.equal(deletedForum.deleted, true);
    assert.equal(deletedForum.id, createdForum.course_module_id);
    forumDeleted = true;

    const createdGlossary = await callMcpTool('create_module', {
      course_id: courseId,
      section_number: createdSection.section_number,
      module_type: 'glossary',
      name: glossaryName,
      options: {
        intro: '<p>MCP glossary activity created by MoodlIA automated tests.</p>',
        display_format: 'dictionary',
        allow_comments: true
      }
    });

    assert.equal(createdGlossary.module_type, 'glossary');
    assert.equal(createdGlossary.name, glossaryName);
    assert.equal(typeof createdGlossary.course_module_id, 'number');
    assert.match(createdGlossary.url, /\/mod\/glossary\/view\.php\?id=/);

    const createdGlossaryEntry = await callMcpTool('create_glossary_entry', {
      course_id: courseId,
      module_id: createdGlossary.course_module_id,
      concept: glossaryConcept,
      definition: glossaryDefinition,
      definition_format: 'html',
      options: {
        aliases: ['moodlia-mcp-glossary'],
        usedynalink: true
      }
    });

    assert.equal(createdGlossaryEntry.module_id, createdGlossary.course_module_id);
    assert.equal(createdGlossaryEntry.concept, glossaryConcept);
    assert.match(createdGlossaryEntry.definition, new RegExp(suffix));

    const searchedGlossaryEntries = await callMcpTool('search_glossary_entries', {
      course_id: courseId,
      module_id: createdGlossary.course_module_id,
      query: glossaryConcept,
      full_search: true,
      include_not_approved: true
    });
    assert.ok(
      searchedGlossaryEntries.entries.some((entry) => entry.entry_id === createdGlossaryEntry.entry_id),
      'MCP search_glossary_entries must list the created entry'
    );

    const updatedGlossaryEntry = await callMcpTool('update_glossary_entry', {
      course_id: courseId,
      module_id: createdGlossary.course_module_id,
      entry_id: createdGlossaryEntry.entry_id,
      concept: updatedGlossaryConcept,
      definition: updatedGlossaryDefinition,
      definition_format: 'html',
      options: {
        aliases: ['moodlia-mcp-updated-glossary'],
        usedynalink: false
      }
    });

    assert.equal(updatedGlossaryEntry.entry_id, createdGlossaryEntry.entry_id);
    assert.equal(updatedGlossaryEntry.concept, updatedGlossaryConcept);
    assert.match(updatedGlossaryEntry.definition, /updated glossary definition/);

    const glossaryDetails = await callMcpTool('get_module_details', {
      course_id: courseId,
      module_id: createdGlossary.course_module_id
    });
    const glossaryExtra = JSON.parse(glossaryDetails.extra_json);
    assert.equal(glossaryDetails.module_type, 'glossary');
    assert.equal(glossaryDetails.course_module_id, createdGlossary.course_module_id);
    assert.equal(glossaryExtra.activity.glossary_id, createdGlossary.instance_id);
    assert.equal(glossaryExtra.activity.allowcomments, 1);
    assert.ok(glossaryExtra.activity.entry_count >= 1);
    assert.ok(
      glossaryExtra.activity.entries.some((entry) =>
        entry.entry_id === createdGlossaryEntry.entry_id &&
        entry.concept === updatedGlossaryConcept
      ),
      'MCP glossary module details must include the updated entry summary'
    );

    const deletedGlossaryEntry = await callMcpTool('delete_glossary_entry', {
      course_id: courseId,
      module_id: createdGlossary.course_module_id,
      entry_id: createdGlossaryEntry.entry_id
    });

    assert.equal(deletedGlossaryEntry.deleted, true);
    assert.equal(deletedGlossaryEntry.id, createdGlossaryEntry.entry_id);
    glossaryEntryDeleted = true;

    const deletedGlossary = await callMcpTool('delete_module', {
      course_id: courseId,
      module_id: createdGlossary.course_module_id
    });

    assert.equal(deletedGlossary.deleted, true);
    assert.equal(deletedGlossary.id, createdGlossary.course_module_id);
    glossaryDeleted = true;

    const createdWiki = await callMcpTool('create_module', {
      course_id: courseId,
      section_number: createdSection.section_number,
      module_type: 'wiki',
      name: wikiName,
      options: {
        intro: '<p>MCP wiki activity created by MoodlIA automated tests.</p>',
        first_page_title: wikiFirstPage,
        wiki_mode: 'collaborative',
        default_format: 'html'
      }
    });

    assert.equal(createdWiki.module_type, 'wiki');
    assert.equal(createdWiki.name, wikiName);
    assert.equal(typeof createdWiki.course_module_id, 'number');
    assert.match(createdWiki.url, /\/mod\/wiki\/view\.php\?id=/);

    const createdWikiPage = await callMcpTool('create_wiki_page', {
      course_id: courseId,
      module_id: createdWiki.course_module_id,
      title: wikiPageTitle,
      content: wikiPageContent,
      content_format: 'html'
    });

    assert.equal(createdWikiPage.module_id, createdWiki.course_module_id);
    assert.equal(createdWikiPage.title, wikiPageTitle);
    assert.match(createdWikiPage.content, /Initial generated wiki content/);

    const listedWikiPages = await callMcpTool('get_wiki_pages', {
      course_id: courseId,
      module_id: createdWiki.course_module_id,
      sort_by: 'title',
      sort_direction: 'ASC',
      include_content: true
    });
    assert.ok(
      listedWikiPages.pages.some((page) => page.page_id === createdWikiPage.page_id),
      'MCP get_wiki_pages must list the created wiki page'
    );

    const updatedWikiPage = await callMcpTool('update_wiki_page', {
      course_id: courseId,
      module_id: createdWiki.course_module_id,
      page_id: createdWikiPage.page_id,
      content: updatedWikiPageContent
    });

    assert.equal(updatedWikiPage.page_id, createdWikiPage.page_id);
    assert.match(updatedWikiPage.content, /Updated generated wiki content/);

    const wikiDetails = await callMcpTool('get_module_details', {
      course_id: courseId,
      module_id: createdWiki.course_module_id
    });
    const wikiExtra = JSON.parse(wikiDetails.extra_json);
    assert.equal(wikiDetails.module_type, 'wiki');
    assert.equal(wikiDetails.course_module_id, createdWiki.course_module_id);
    assert.equal(wikiExtra.activity.wiki_id, createdWiki.instance_id);
    if (wikiExtra.activity.wiki_mode !== '') {
      assert.equal(wikiExtra.activity.wiki_mode, 'collaborative');
    }
    assert.ok(wikiExtra.activity.page_count >= 1);
    assert.ok(
      wikiExtra.activity.pages.some((page) =>
        page.page_id === createdWikiPage.page_id &&
        page.title === wikiPageTitle
      ),
      'MCP wiki module details must include the updated page summary'
    );

    const deletedWiki = await callMcpTool('delete_module', {
      course_id: courseId,
      module_id: createdWiki.course_module_id
    });

    assert.equal(deletedWiki.deleted, true);
    assert.equal(deletedWiki.id, createdWiki.course_module_id);
    wikiDeleted = true;

    const createdFolder = await callMcpTool('create_module', {
      course_id: courseId,
      section_number: createdSection.section_number,
      module_type: 'folder',
      name: folderName,
      options: {}
    });

    assert.equal(createdFolder.module_type, 'folder');
    assert.equal(createdFolder.name, folderName);
    assert.equal(typeof createdFolder.course_module_id, 'number');

    const uploadedFile = await callMcpTool('upload_folder_file', {
      course_id: courseId,
      module_id: createdFolder.course_module_id,
      filename,
      upload_reference: Buffer.from(`Created by MoodlIA MCP ${suffix}`, 'utf8').toString('base64')
    });

    assert.equal(uploadedFile.filename, filename);
    assert.equal(typeof uploadedFile.file_id, 'number');

    const listedFolderFiles = await callMcpTool('get_folder_files', {
      course_id: courseId,
      module_id: createdFolder.course_module_id
    });
    assert.ok(
      listedFolderFiles.files.some((file) => file.file_id === uploadedFile.file_id && file.filename === filename),
      'MCP uploaded file must be present in folder file listing'
    );

    const folderDetails = await callMcpTool('get_module_details', {
      course_id: courseId,
      module_id: createdFolder.course_module_id
    });
    const folderExtra = JSON.parse(folderDetails.extra_json);
    assert.equal(folderDetails.module_type, 'folder');
    assert.equal(folderExtra.activity.folder_id, createdFolder.instance_id);
    assert.equal(folderExtra.activity.file_count, listedFolderFiles.files.length);
    assert.ok(
      folderExtra.activity.files.some((file) => file.file_id === uploadedFile.file_id && file.filename === filename),
      'MCP folder details must expose uploaded file summaries'
    );

    const downloadedFile = await callMcpTool('download_folder_file', {
      course_id: courseId,
      module_id: createdFolder.course_module_id,
      file_id: uploadedFile.file_id
    });

    assert.equal(downloadedFile.file_id, uploadedFile.file_id);
    assert.equal(downloadedFile.filename, filename);

    const deletedFile = await callMcpTool('delete_folder_file', {
      course_id: courseId,
      module_id: createdFolder.course_module_id,
      file_id: uploadedFile.file_id
    });

    assert.equal(deletedFile.deleted, true);
    assert.equal(deletedFile.id, uploadedFile.file_id);
    fileDeleted = true;

    const deletedFolder = await callMcpTool('delete_module', {
      course_id: courseId,
      module_id: createdFolder.course_module_id
    });

    assert.equal(deletedFolder.deleted, true);
    assert.equal(deletedFolder.id, createdFolder.course_module_id);
    folderDeleted = true;

    const createdCategory = await callMcpTool('create_question_category', {
      course_id: courseId,
      name: categoryName,
      description: 'Created by MoodlIA MCP automated tests.'
    });

    assert.equal(createdCategory.name, categoryName);
    assert.equal(typeof createdCategory.category_id, 'number');
    assert.equal(createdCategory.bank_scope, 'course_shared');
    assert.equal(typeof createdCategory.question_bank_module_id, 'number');
    assert.equal(createdCategory.quiz_module_id, null);

    const updatedCategory = await callMcpTool('update_question_category', {
      category_id: createdCategory.category_id,
      context_id: createdCategory.context_id,
      name: updatedCategoryName,
      description: 'Updated by MoodlIA MCP automated tests.'
    });

    assert.equal(updatedCategory.category_id, createdCategory.category_id);
    assert.equal(updatedCategory.name, updatedCategoryName);

    const emptyCategory = await callMcpTool('create_question_category', {
      course_id: courseId,
      name: emptyCategoryName
    });

    assert.equal(emptyCategory.bank_scope, 'course_shared');
    assert.equal(typeof emptyCategory.question_bank_module_id, 'number');
    assert.equal(emptyCategory.quiz_module_id, null);

    const deletedEmptyCategory = await callMcpTool('delete_question_category', {
      category_id: emptyCategory.category_id,
      context_id: emptyCategory.context_id,
      delete_mode: 'delete'
    });

    assert.equal(deletedEmptyCategory.deleted, true);
    assert.equal(deletedEmptyCategory.id, emptyCategory.category_id);
    emptyCategoryDeleted = true;

    const createdQuestion = await callMcpTool('create_question', {
      category_id: createdCategory.category_id,
      context_id: createdCategory.context_id,
      question_type: 'truefalse',
      name: questionName,
      question_text: '<p>Is this question generated by the MoodlIA MCP endpoint?</p>',
      options: {
        correct_answer: true,
        feedback_true: 'Correct.',
        feedback_false: 'Incorrect.'
      }
    });

    assert.equal(createdQuestion.category_id, createdCategory.category_id);
    assert.equal(createdQuestion.question_type, 'truefalse');
    assert.equal(createdQuestion.name, questionName);
    assert.equal(typeof createdQuestion.question_id, 'number');

    const updatedQuestion = await callMcpTool('update_question', {
      question_id: createdQuestion.question_id,
      name: updatedQuestionName,
      question_text: '<p>Was this question updated by the MoodlIA MCP endpoint?</p>',
      options: {
        correct_answer: false,
        feedback_true: 'No longer correct.',
        feedback_false: 'Correct after update.'
      }
    });

    assert.equal(updatedQuestion.question_type, 'truefalse');
    assert.equal(updatedQuestion.name, updatedQuestionName);
    assert.equal(typeof updatedQuestion.question_id, 'number');

    const createdShortAnswer = await callMcpTool('create_question', {
      category_id: createdCategory.category_id,
      context_id: createdCategory.context_id,
      question_type: 'shortanswer',
      name: shortAnswerName,
      question_text: '<p>Write the keyword generated by the MoodlIA MCP endpoint.</p>',
      options: {
        answers: [
          {
            text: 'MoodlIA',
            fraction: 1,
            feedback: 'Correct.'
          },
          {
            text: 'moodlia',
            fraction: 0.5,
            feedback: 'Case-insensitive partial credit.'
          }
        ],
        case_sensitive: false
      }
    });

    assert.equal(createdShortAnswer.category_id, createdCategory.category_id);
    assert.equal(createdShortAnswer.question_type, 'shortanswer');
    assert.equal(createdShortAnswer.name, shortAnswerName);
    assert.equal(typeof createdShortAnswer.question_id, 'number');

    const updatedShortAnswer = await callMcpTool('update_question', {
      question_id: createdShortAnswer.question_id,
      name: updatedShortAnswerName,
      question_text: '<p>Write the updated keyword generated by the MoodlIA MCP endpoint.</p>',
      options: {
        answers: [
          {
            text: 'Updated MoodlIA',
            fraction: 1,
            feedback: 'Correct after update.'
          }
        ],
        case_sensitive: false
      }
    });

    assert.equal(updatedShortAnswer.question_type, 'shortanswer');
    assert.equal(updatedShortAnswer.name, updatedShortAnswerName);
    assert.equal(typeof updatedShortAnswer.question_id, 'number');

    const createdMultichoice = await callMcpTool('create_question', {
      category_id: createdCategory.category_id,
      context_id: createdCategory.context_id,
      question_type: 'multichoice',
      name: multichoiceName,
      question_text: '<p>Choose the generated MoodlIA MCP option.</p>',
      options: {
        single: true,
        shuffle_answers: false,
        answer_numbering: 'abc',
        answers: [
          {
            text: 'Generated option',
            fraction: 1,
            feedback: 'Correct.'
          },
          {
            text: 'Distractor option',
            fraction: 0,
            feedback: 'Incorrect.'
          },
          {
            text: 'Another distractor',
            fraction: 0,
            feedback: 'Incorrect.'
          }
        ],
        correct_feedback: 'Correct choice.',
        incorrect_feedback: 'Review the generated content.'
      }
    });

    assert.equal(createdMultichoice.category_id, createdCategory.category_id);
    assert.equal(createdMultichoice.question_type, 'multichoice');
    assert.equal(createdMultichoice.name, multichoiceName);
    assert.equal(typeof createdMultichoice.question_id, 'number');

    const updatedMultichoice = await callMcpTool('update_question', {
      question_id: createdMultichoice.question_id,
      name: updatedMultichoiceName,
      question_text: '<p>Choose the updated generated MoodlIA MCP option.</p>',
      options: {
        single: true,
        shuffle_answers: false,
        answer_numbering: 'abc',
        answers: [
          {
            text: 'Updated generated option',
            fraction: 1,
            feedback: 'Correct after update.'
          },
          {
            text: 'Old distractor option',
            fraction: 0,
            feedback: 'Incorrect.'
          }
        ],
        correct_feedback: 'Updated correct choice.',
        incorrect_feedback: 'Updated incorrect choice.'
      }
    });

    assert.equal(updatedMultichoice.question_type, 'multichoice');
    assert.equal(updatedMultichoice.name, updatedMultichoiceName);
    assert.equal(typeof updatedMultichoice.question_id, 'number');

    const createdNumerical = await callMcpTool('create_question', {
      category_id: createdCategory.category_id,
      context_id: createdCategory.context_id,
      question_type: 'numerical',
      name: numericalName,
      question_text: '<p>Enter the generated numeric value from the MoodlIA MCP endpoint.</p>',
      options: {
        answers: [
          {
            text: '42',
            tolerance: '0.01',
            fraction: 1,
            feedback: 'Correct.'
          }
        ]
      }
    });

    assert.equal(createdNumerical.category_id, createdCategory.category_id);
    assert.equal(createdNumerical.question_type, 'numerical');
    assert.equal(createdNumerical.name, numericalName);
    assert.equal(typeof createdNumerical.question_id, 'number');

    const updatedNumerical = await callMcpTool('update_question', {
      question_id: createdNumerical.question_id,
      name: updatedNumericalName,
      question_text: '<p>Enter the updated generated numeric value from the MoodlIA MCP endpoint.</p>',
      options: {
        answers: [
          {
            text: '43',
            tolerance: '0.01',
            fraction: 1,
            feedback: 'Correct after update.'
          }
        ]
      }
    });

    assert.equal(updatedNumerical.question_type, 'numerical');
    assert.equal(updatedNumerical.name, updatedNumericalName);
    assert.equal(typeof updatedNumerical.question_id, 'number');

    const createdMatching = await callMcpTool('create_question', {
      category_id: createdCategory.category_id,
      context_id: createdCategory.context_id,
      question_type: 'matching',
      name: matchingName,
      question_text: '<p>Match each generated Moodle concept with its MCP meaning.</p>',
      options: {
        shuffle_answers: false,
        subquestions: [
          {
            question: 'REST endpoint',
            answer: 'HTTP interface'
          },
          {
            question: 'MCP tool',
            answer: 'Tool call interface'
          },
          {
            question: 'CLI command',
            answer: 'Terminal interface'
          }
        ],
        correct_feedback: 'All MCP pairs are correct.',
        incorrect_feedback: 'Review the generated interfaces.'
      }
    });

    assert.equal(createdMatching.category_id, createdCategory.category_id);
    assert.equal(createdMatching.question_type, 'matching');
    assert.equal(createdMatching.name, matchingName);
    assert.equal(typeof createdMatching.question_id, 'number');

    const updatedMatching = await callMcpTool('update_question', {
      question_id: createdMatching.question_id,
      name: updatedMatchingName,
      question_text: '<p>Match each updated Moodle concept with its MCP meaning.</p>',
      options: {
        shuffle_answers: false,
        pairs: [
          {
            question: 'Course bank',
            answer: 'Shared question storage'
          },
          {
            question: 'Quiz bank',
            answer: 'Activity-private storage'
          }
        ],
        extra_answers: ['Unused distractor'],
        correct_feedback: 'Updated MCP pairs are correct.',
        incorrect_feedback: 'Review the updated banks.'
      }
    });

    assert.equal(updatedMatching.question_type, 'matching');
    assert.equal(updatedMatching.name, updatedMatchingName);
    assert.equal(typeof updatedMatching.question_id, 'number');

    const createdEssay = await callMcpTool('create_question', {
      category_id: createdCategory.category_id,
      context_id: createdCategory.context_id,
      question_type: 'essay',
      name: essayName,
      question_text: '<p>Explain how MoodlIA creates Moodle content through MCP.</p>',
      options: {
        response_format: 'plain',
        response_required: true,
        response_field_lines: 10,
        response_template: 'Write a concise explanation.',
        grader_info: '<p>Look for REST, MCP, and CLI parity.</p>'
      }
    });

    assert.equal(createdEssay.category_id, createdCategory.category_id);
    assert.equal(createdEssay.question_type, 'essay');
    assert.equal(createdEssay.name, essayName);
    assert.equal(typeof createdEssay.question_id, 'number');

    const updatedEssay = await callMcpTool('update_question', {
      question_id: createdEssay.question_id,
      name: updatedEssayName,
      question_text: '<p>Explain how MoodlIA keeps Moodle content generation verifiable through MCP.</p>',
      options: {
        response_format: 'plain',
        response_required: true,
        response_field_lines: 12,
        response_template: 'Mention browser verification.',
        grader_info: '<p>Look for browser-visible verification details.</p>'
      }
    });

    assert.equal(updatedEssay.question_type, 'essay');
    assert.equal(updatedEssay.name, updatedEssayName);
    assert.equal(typeof updatedEssay.question_id, 'number');

    const listedQuestions = await callMcpTool('get_questions', {
      course_id: courseId,
      category_id: createdCategory.category_id,
      question_bank_module_id: createdCategory.question_bank_module_id
    });
    assert.ok(
      listedQuestions.questions.some((question) =>
        question.question_id === updatedQuestion.question_id &&
        question.name === updatedQuestionName &&
        question.question_type === 'truefalse' &&
        question.question_text.includes('Was this question updated by the MoodlIA MCP endpoint?')
      ),
      'MCP get_questions must list updated truefalse questions in the category'
    );
    assert.ok(
      listedQuestions.questions.some((question) =>
        question.question_id === updatedMatching.question_id &&
        question.name === updatedMatchingName &&
        question.question_type === 'matching'
      ),
      'MCP get_questions must expose matching questions with canonical question_type'
    );

    const moveTargetCategory = await callMcpTool('create_question_category', {
      course_id: courseId,
      name: moveTargetCategoryName,
      question_bank_module_id: createdCategory.question_bank_module_id,
      description: 'Target category for MoodlIA MCP move_question tests.'
    });

    assert.equal(moveTargetCategory.name, moveTargetCategoryName);
    assert.equal(moveTargetCategory.question_bank_module_id, createdCategory.question_bank_module_id);

    const movableQuestion = await callMcpTool('create_question', {
      category_id: createdCategory.category_id,
      context_id: createdCategory.context_id,
      question_type: 'truefalse',
      name: movableQuestionName,
      question_text: '<p>This question will be moved by MoodlIA MCP tests.</p>',
      options: {
        correct_answer: true
      }
    });

    const movedQuestion = await callMcpTool('move_question', {
      course_id: courseId,
      question_id: movableQuestion.question_id,
      target_category_id: moveTargetCategory.category_id,
      target_question_bank_module_id: createdCategory.question_bank_module_id
    });
    assert.equal(movedQuestion.moved, true);
    assert.equal(movedQuestion.question_id, movableQuestion.question_id);
    assert.equal(movedQuestion.source_category_id, createdCategory.category_id);
    assert.equal(movedQuestion.target_category_id, moveTargetCategory.category_id);
    assert.equal(movedQuestion.target_bank_scope, 'course_shared');

    const sourceQuestionsAfterMove = await callMcpTool('get_questions', {
      course_id: courseId,
      category_id: createdCategory.category_id,
      question_bank_module_id: createdCategory.question_bank_module_id
    });
    assert.equal(
      sourceQuestionsAfterMove.questions.some((question) => question.question_id === movableQuestion.question_id),
      false,
      'MCP move_question must remove the question from the source category listing'
    );

    const targetQuestionsAfterMove = await callMcpTool('get_questions', {
      course_id: courseId,
      category_id: moveTargetCategory.category_id,
      question_bank_module_id: createdCategory.question_bank_module_id
    });
    assert.ok(
      targetQuestionsAfterMove.questions.some((question) =>
        question.question_id === movableQuestion.question_id &&
        question.name === movableQuestionName
      ),
      'MCP move_question must add the question to the target category listing'
    );

    const deletableQuestion = await callMcpTool('create_question', {
      category_id: createdCategory.category_id,
      context_id: createdCategory.context_id,
      question_type: 'truefalse',
      name: deletedQuestionName,
      question_text: '<p>This question will be deleted by MoodlIA MCP tests.</p>',
      options: {
        correct_answer: true
      }
    });

    const listedQuestionsBeforeDelete = await callMcpTool('get_questions', {
      course_id: courseId,
      category_id: createdCategory.category_id,
      question_bank_module_id: createdCategory.question_bank_module_id
    });
    assert.ok(
      listedQuestionsBeforeDelete.questions.some((question) => question.question_id === deletableQuestion.question_id),
      'MCP get_questions must list a newly created deletable question'
    );

    const deletedQuestion = await callMcpTool('delete_question', {
      question_id: deletableQuestion.question_id
    });
    assert.equal(deletedQuestion.deleted, true);
    assert.equal(deletedQuestion.id, deletableQuestion.question_id);

    const listedQuestionsAfterDelete = await callMcpTool('get_questions', {
      course_id: courseId,
      category_id: createdCategory.category_id,
      question_bank_module_id: createdCategory.question_bank_module_id
    });
    assert.equal(
      listedQuestionsAfterDelete.questions.some((question) => question.question_id === deletableQuestion.question_id),
      false,
      'MCP get_questions must not list a deleted question'
    );

    const createdQuiz = await callMcpTool('create_module', {
      course_id: courseId,
      section_number: createdSection.section_number,
      module_type: 'quiz',
      name: quizName,
      options: {
        intro: '<p>MCP quiz activity created by MoodlIA automated tests.</p>',
        grade: 20,
        time_open: Math.floor(Date.now() / 1000) - 60,
        time_close: Math.floor(Date.now() / 1000) + 86400,
        time_limit_seconds: 3600,
        overdue_handling: 'autosubmit',
        attempts: 2,
        grade_method: 'average',
        questions_per_page: 2,
        navigation_method: 'free',
        preferred_behaviour: 'deferredfeedback',
        shuffle_answers: false,
        attempt_on_last: true,
        decimal_points: 1,
        question_decimal_points: -1,
        show_user_picture: 'small',
        show_blocks: false,
        browser_security: 'none',
        allow_offline_attempts: false
      }
    });

    assert.equal(createdQuiz.module_type, 'quiz');
    assert.equal(createdQuiz.name, quizName);
    assert.equal(typeof createdQuiz.course_module_id, 'number');

    const privateCategory = await callMcpTool('create_question_category', {
      course_id: courseId,
      name: privateCategoryName,
      bank_scope: 'quiz_private',
      quiz_module_id: createdQuiz.course_module_id,
      description: 'Created in the quiz-private bank by MoodlIA MCP tests.'
    });

    assert.equal(privateCategory.name, privateCategoryName);
    assert.equal(privateCategory.bank_scope, 'quiz_private');
    assert.equal(privateCategory.question_bank_module_id, null);
    assert.equal(privateCategory.quiz_module_id, createdQuiz.course_module_id);

    const privateQuestion = await callMcpTool('create_question', {
      category_id: privateCategory.category_id,
      context_id: privateCategory.context_id,
      question_type: 'truefalse',
      name: privateQuestionName,
      question_text: '<p>Is this question stored in the quiz-private bank by MCP?</p>',
      options: {
        correct_answer: true,
        feedback_true: 'Correct.',
        feedback_false: 'Incorrect.'
      }
    });

    assert.equal(privateQuestion.category_id, privateCategory.category_id);
    assert.equal(privateQuestion.question_type, 'truefalse');

    const quizQuestion = await callMcpTool('add_question_to_quiz', {
      quiz_module_id: createdQuiz.course_module_id,
      question_id: privateQuestion.question_id
    });

    assert.equal(quizQuestion.question_id, privateQuestion.question_id);
    assert.equal(typeof quizQuestion.quiz_id, 'number');
    assert.equal(typeof quizQuestion.slot, 'number');
    assert.equal(typeof quizQuestion.maxmark, 'number');
    assert.ok(quizQuestion.maxmark > 0, 'Quiz questions must have a positive slot maxmark.');

    const listedQuizQuestions = await callMcpTool('get_quiz_questions', {
      quiz_module_id: createdQuiz.course_module_id
    });
    assert.ok(
      listedQuizQuestions.questions.some((question) =>
        question.question_id === privateQuestion.question_id &&
        question.slot === quizQuestion.slot &&
        question.maxmark > 0
      ),
      'MCP added quiz question must be present in quiz question listing'
    );

    const updatedQuizQuestionSlot = await callMcpTool('update_quiz_question_slot', {
      quiz_module_id: createdQuiz.course_module_id,
      slot: quizQuestion.slot,
      max_mark: 2.5
    });
    assert.equal(updatedQuizQuestionSlot.updated, true);
    assert.equal(updatedQuizQuestionSlot.quiz_module_id, createdQuiz.course_module_id);
    assert.equal(updatedQuizQuestionSlot.slot, quizQuestion.slot);
    assert.equal(updatedQuizQuestionSlot.question_id, privateQuestion.question_id);
    assert.equal(updatedQuizQuestionSlot.maxmark, 2.5);

    const listedQuizQuestionsAfterSlotUpdate = await callMcpTool('get_quiz_questions', {
      quiz_module_id: createdQuiz.course_module_id
    });
    assert.ok(
      listedQuizQuestionsAfterSlotUpdate.questions.some((question) =>
        question.question_id === privateQuestion.question_id &&
        question.slot === quizQuestion.slot &&
        question.maxmark === 2.5
      ),
      'MCP update_quiz_question_slot must update the slot maxmark in quiz question listing'
    );

    const removableQuizQuestion = await callMcpTool('create_question', {
      category_id: privateCategory.category_id,
      context_id: privateCategory.context_id,
      question_type: 'truefalse',
      name: removableQuizQuestionName,
      question_text: '<p>Will this MCP question be removed from the quiz?</p>',
      options: {
        correct_answer: true
      }
    });

    const removableQuizSlot = await callMcpTool('add_question_to_quiz', {
      quiz_module_id: createdQuiz.course_module_id,
      question_id: removableQuizQuestion.question_id
    });
    assert.equal(removableQuizSlot.question_id, removableQuizQuestion.question_id);

    const removedQuizQuestion = await callMcpTool('remove_question_from_quiz', {
      quiz_module_id: createdQuiz.course_module_id,
      slot: removableQuizSlot.slot
    });
    assert.equal(removedQuizQuestion.removed, true);
    assert.equal(removedQuizQuestion.question_id, removableQuizQuestion.question_id);
    assert.equal(removedQuizQuestion.slot, removableQuizSlot.slot);

    const listedQuizQuestionsAfterRemove = await callMcpTool('get_quiz_questions', {
      quiz_module_id: createdQuiz.course_module_id
    });
    assert.equal(
      listedQuizQuestionsAfterRemove.questions.some((question) => question.question_id === removableQuizQuestion.question_id),
      false,
      'MCP removed quiz question must not be present in quiz question listing'
    );
    assert.ok(
      listedQuizQuestionsAfterRemove.questions.some((question) => question.question_id === privateQuestion.question_id),
      'MCP remove_question_from_quiz must leave other quiz questions in place'
    );

    const randomQuizQuestions = await callMcpTool('add_random_questions_to_quiz', {
      quiz_module_id: createdQuiz.course_module_id,
      category_id: createdCategory.category_id,
      number: 1,
      question_bank_module_id: createdCategory.question_bank_module_id
    });
    assert.equal(randomQuizQuestions.quiz_module_id, createdQuiz.course_module_id);
    assert.equal(randomQuizQuestions.category_id, createdCategory.category_id);
    assert.equal(randomQuizQuestions.added_count, 1);
    assert.equal(randomQuizQuestions.slots.length, 1);
    assert.equal(randomQuizQuestions.slots[0].question_type, 'random');
    assert.ok(randomQuizQuestions.slots[0].maxmark > 0, 'MCP random quiz slot must have a positive maxmark');

    const listedQuizQuestionsAfterRandom = await callMcpTool('get_quiz_questions', {
      quiz_module_id: createdQuiz.course_module_id
    });
    assert.ok(
      listedQuizQuestionsAfterRandom.questions.some((question) =>
        question.slot === randomQuizQuestions.slots[0].slot &&
        question.question_type === 'random'
      ),
      'MCP random quiz slot must be present in quiz question listing'
    );
    assert.ok(
      listedQuizQuestionsAfterRandom.questions.some((question) => question.question_id === privateQuestion.question_id),
      'MCP add_random_questions_to_quiz must leave explicitly added questions in place'
    );

    const quizDetails = await callMcpTool('get_module_details', {
      course_id: courseId,
      module_id: createdQuiz.course_module_id
    });
    const quizExtra = JSON.parse(quizDetails.extra_json);
    assert.equal(quizDetails.module_type, 'quiz');
    assert.equal(quizDetails.course_module_id, createdQuiz.course_module_id);
    assert.equal(quizExtra.activity.quiz_id, quizQuestion.quiz_id);
    assert.equal(quizExtra.activity.grade, 20);
    assert.equal(quizExtra.activity.timelimit, 3600);
    assert.equal(quizExtra.activity.attempts, 2);
    assert.equal(quizExtra.activity.preferredbehaviour, 'deferredfeedback');
    assert.equal(quizExtra.activity.questionsperpage, 2);
    assert.equal(quizExtra.activity.navmethod, 'free');
    assert.equal(quizExtra.activity.shuffleanswers, 0);
    assert.equal(quizExtra.activity.question_count, listedQuizQuestionsAfterRandom.questions.length);
    assert.ok(quizExtra.activity.sumgrades > 0, 'MCP quiz details must expose positive sumgrades after adding a question');

    const startedQuizAttempt = await callMcpTool('start_quiz_attempt', {
      quiz_module_id: createdQuiz.course_module_id
    });
    assert.equal(startedQuizAttempt.quiz_id, quizQuestion.quiz_id);
    assert.equal(startedQuizAttempt.quiz_module_id, createdQuiz.course_module_id);
    assert.ok(startedQuizAttempt.attempt.attempt_id > 0, 'MCP quiz attempt id must be positive.');
    assert.equal(startedQuizAttempt.attempt.quiz_id, quizQuestion.quiz_id);
    assert.equal(startedQuizAttempt.attempt.user_id, currentUser.id);
    assert.equal(startedQuizAttempt.attempt.state, 'inprogress');

    const listedQuizAttempts = await callMcpTool('get_quiz_attempts', {
      quiz_module_id: createdQuiz.course_module_id,
      user_id: currentUser.id,
      status: 'all',
      include_previews: true
    });
    assert.ok(
      listedQuizAttempts.attempts.some((attempt) =>
        attempt.attempt_id === startedQuizAttempt.attempt.attempt_id &&
        attempt.state === 'inprogress'
      ),
      'started MCP quiz attempt must be present in quiz attempt listing'
    );

    const deletedQuiz = await callMcpTool('delete_module', {
      course_id: courseId,
      module_id: createdQuiz.course_module_id
    });

    assert.equal(deletedQuiz.deleted, true);
    assert.equal(deletedQuiz.id, createdQuiz.course_module_id);
    quizDeleted = true;

    const deletedSection = await callMcpTool('delete_section', {
      course_id: courseId,
      section_id: createdSection.section_id,
      delete_mode: 'delete'
    });

    assert.equal(deletedSection.deleted, true);
    assert.equal(deletedSection.id, createdSection.section_id);
    sectionDeleted = true;

    const deletedCalendarEvent = await callMcpTool('delete_calendar_event', {
      course_id: courseId,
      event_id: calendarEventId
    });

    assert.equal(deletedCalendarEvent.deleted, true);
    assert.equal(deletedCalendarEvent.id, calendarEventId);
    calendarEventDeleted = true;
    calendarEventId = null;

    const deletedCourse = await callMcpTool('delete_course', {
      course_id: courseId
    });

    assert.equal(deletedCourse.deleted, true);
    assert.equal(deletedCourse.id, courseId);
    courseId = null;

    const deletedCourseCategory = await callMcpTool('delete_course_category', {
      category_id: courseCategoryId
    });

    assert.equal(deletedCourseCategory.deleted, true);
    assert.equal(deletedCourseCategory.id, courseCategoryId);
    courseCategoryDeleted = true;
    courseCategoryId = null;
  } catch (error) {
    if (courseId) {
      console.error(`Generated MCP course left in Moodle for inspection: ${courseId}`);
      if (!pageDeleted) {
        console.error('MCP page cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!duplicatedPageDeleted) {
        console.error('MCP duplicated page cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!userUnenrolled) {
        console.error('MCP user unenrolment cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!groupMemberRemoved) {
        console.error('MCP group member cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!groupRemovedFromGrouping) {
        console.error('MCP grouping membership cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!groupingDeleted) {
        console.error('MCP grouping cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!groupDeleted) {
        console.error('MCP group cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!assignDeleted) {
        console.error('MCP assignment cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!bookDeleted) {
        console.error('MCP book cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!labelDeleted) {
        console.error('MCP label cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!urlDeleted) {
        console.error('MCP URL cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!forumDeleted) {
        console.error('MCP forum cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!glossaryEntryDeleted) {
        console.error('MCP glossary entry cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!glossaryDeleted) {
        console.error('MCP glossary cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!wikiDeleted) {
        console.error('MCP wiki cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!fileDeleted) {
        console.error('MCP file cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!folderDeleted) {
        console.error('MCP folder cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!emptyCategoryDeleted) {
        console.error('MCP empty question category cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!quizDeleted) {
        console.error('MCP quiz cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!sectionDeleted) {
        console.error('MCP section cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!calendarEventDeleted) {
        console.error('MCP calendar event cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
    }
    if (calendarEventId && !calendarEventDeleted) {
      console.error(`Generated MCP calendar event left in Moodle for inspection: ${calendarEventId}`);
    }
    if (courseCategoryId && !courseCategoryDeleted) {
      console.error(`Generated MCP course category left in Moodle for inspection: ${courseCategoryId}`);
    }
    throw error;
  }
});
