import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';
import { fromRoot } from '../helpers/paths.mjs';
import { getTimeout, getEnv, requireEnv, resolveCliCommand } from '../helpers/env.mjs';

const execFileAsync = promisify(execFile);
const hasCliConfig = requireEnv(['MOODLE_BASE_URL', 'MOODLE_REST_TOKEN']);

async function runCli(args) {
  const configured = resolveCliCommand();
  const localCli = fromRoot('cli/moodle-mcp.mjs');
  const commandPath = configured ?? localCli;
  const command = commandPath.endsWith('.mjs') || commandPath.endsWith('.js') ? process.execPath : commandPath;
  const commandArgs = command === process.execPath ? [commandPath, ...args] : args;
  const { stdout } = await execFileAsync(command, commandArgs, {
    timeout: getTimeout(),
    env: {
      ...process.env,
      MOODLE_BASE_URL: getEnv('MOODLE_BASE_URL'),
      MOODLE_REST_TOKEN: getEnv('MOODLE_REST_TOKEN')
    }
  });

  return stdout.trim();
}

async function callCli(args) {
  return JSON.parse(await runCli([...args, '--format', 'json']));
}

async function callCliFailure(args) {
  try {
    await runCli([...args, '--format', 'json']);
  } catch (error) {
    const rawError = (error.stderr || error.stdout || '').trim();
    assert.ok(rawError, 'CLI failures should print a JSON error payload.');
    const payload = JSON.parse(rawError);

    assert.equal(payload.error, true);
    assert.equal(typeof payload.message, 'string');

    return payload;
  }

  assert.fail('CLI command was expected to fail.');
}

test('CLI smoke: get-current-user returns JSON', { skip: !hasCliConfig }, async () => {
  const payload = await callCli(['get-current-user']);

  assert.equal(typeof payload, 'object');
});

test('CLI smoke: get-courses returns JSON', { skip: !hasCliConfig }, async () => {
  const payload = await callCli(['get-courses']);

  assert.ok(Array.isArray(payload) || Array.isArray(payload?.courses), 'CLI course response should include a course list.');
});

test('CLI smoke: get-course-categories returns JSON', { skip: !hasCliConfig }, async () => {
  const payload = await callCli(['get-course-categories']);

  assert.ok(Array.isArray(payload?.categories), 'CLI course category response should include a category list.');
});

test('CLI validation: unknown commands return JSON errors', async () => {
  const payload = await callCliFailure(['unknown-operation']);

  assert.match(payload.message, /Unknown command: unknown-operation/);
});

test('CLI validation: missing required options return JSON errors', async () => {
  const payload = await callCliFailure(['create-course', '--shortname', 'missing-fullname-test']);

  assert.match(payload.message, /Missing required option --fullname/);
});

test('CLI validation: invalid boolean options return JSON errors', async () => {
  const payload = await callCliFailure([
    'create-course',
    '--fullname', 'Invalid boolean test',
    '--shortname', 'invalid-boolean-test',
    '--visible', 'maybe'
  ]);

  assert.match(payload.message, /visible must be a boolean/);
});

test('CLI validation: invalid JSON object options return JSON errors', async () => {
  const payload = await callCliFailure([
    'create-module',
    '--course-id', '1',
    '--section-number', '1',
    '--module-type', 'page',
    '--name', 'Invalid JSON test',
    '--options', '{invalid-json'
  ]);

  assert.match(payload.message, /JSON|Expected property name|Unexpected token/i);
});

test('CLI validation: invalid module type options return JSON errors', async () => {
  const payload = await callCliFailure([
    'create-module',
    '--course-id', '1',
    '--section-number', '0',
    '--module-type', 'unsupported',
    '--name', 'Invalid module type test'
  ]);

  assert.match(payload.message, /module_type must be one of: assign, book, choice, data, feedback, lesson, lti, page, folder, forum, glossary, label, qbank, quiz, resource, subsection, url, wiki, workshop/);
});

test('CLI validation: invalid question type options return JSON errors', async () => {
  const payload = await callCliFailure([
    'create-question',
    '--category-id', '1',
    '--context-id', '1',
    '--question-type', 'unsupported',
    '--name', 'Invalid question type test',
    '--question-text', '<p>Invalid question type test.</p>',
    '--options', '{}'
  ]);

  assert.match(payload.message, /question_type must be one of: truefalse, shortanswer, multichoice, numerical, essay, matching, description, randomsamatch, gapselect, ddwtos, ordering, multianswer, ddmarker, ddimageortext, calculatedsimple, calculated, calculatedmulti/);
});

test('CLI generated course, section, and module lifecycle works', { skip: !hasCliConfig }, async () => {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const courseCategoryName = `MoodlIA CLI Course Category ${suffix}`;
  const updatedCourseCategoryName = `MoodlIA CLI Updated Course Category ${suffix}`;
  const createdCourseName = `MoodlIA CLI Test Course ${suffix}`;
  const createdCourseShortname = `moodlia-cli-${suffix}`;
  const updatedCourseName = `MoodlIA CLI Updated Course ${suffix}`;
  const createdCourseSummary = `<p>MoodlIA CLI course summary ${suffix}</p>`;
  const updatedCourseSummary = `<p>MoodlIA CLI updated course summary ${suffix}</p>`;
  const eventName = `MoodlIA CLI Calendar Event ${suffix}`;
  const updatedEventName = `MoodlIA CLI Updated Calendar Event ${suffix}`;
  const eventDescription = `MoodlIA CLI calendar description ${suffix}`;
  const updatedEventDescription = `MoodlIA CLI updated calendar description ${suffix}`;
  const eventStart = Math.floor(Date.now() / 1000) + 86400;
  const updatedEventStart = eventStart + 3600;
  const courseStart = eventStart - 86400;
  const courseEnd = eventStart + 604800;
  const updatedCourseEnd = eventStart + 1209600;
  const groupName = `MoodlIA CLI Group ${suffix}`;
  const updatedGroupName = `MoodlIA CLI Updated Group ${suffix}`;
  const groupingName = `MoodlIA CLI Grouping ${suffix}`;
  const updatedGroupingName = `MoodlIA CLI Updated Grouping ${suffix}`;
  const groupingDescription = `MoodlIA CLI grouping description ${suffix}`;
  const updatedGroupingDescription = `MoodlIA CLI updated grouping description ${suffix}`;
  const sectionName = `MoodlIA CLI Test Section ${suffix}`;
  const updatedSectionName = `MoodlIA CLI Updated Section ${suffix}`;
  const moduleName = `MoodlIA CLI Test Page ${suffix}`;
  const updatedModuleName = `MoodlIA CLI Updated Page ${suffix}`;
  const duplicatedModuleName = `MoodlIA CLI Duplicated Page ${suffix}`;
  const assignName = `MoodlIA CLI Test Assignment ${suffix}`;
  const updatedAssignName = `MoodlIA CLI Updated Assignment ${suffix}`;
  const assignIntro = `MoodlIA CLI assignment intro ${suffix}`;
  const assignmentSubmissionText = `MoodlIA CLI assignment submission ${suffix}`;
  const assignmentGrade = 87.5;
  const assignmentFeedbackComment = `MoodlIA CLI assignment feedback ${suffix}`;
  const bookName = `MoodlIA CLI Test Book ${suffix}`;
  const labelName = `MoodlIA CLI Test Label ${suffix}`;
  const labelText = `MoodlIA CLI label content ${suffix}`;
  const urlName = `MoodlIA CLI Test URL ${suffix}`;
  const updatedUrlName = `MoodlIA CLI Updated URL ${suffix}`;
  const externalUrl = `https://example.com/moodlia-cli-${suffix}`;
  const forumName = `MoodlIA CLI Forum ${suffix}`;
  const updatedForumName = `MoodlIA CLI Updated Forum ${suffix}`;
  const forumIntro = `MoodlIA CLI forum intro ${suffix}`;
  const forumDiscussionName = `MoodlIA CLI Discussion ${suffix}`;
  const forumDiscussionMessage = `<p>MoodlIA CLI discussion message ${suffix}</p>`;
  const forumReplySubject = `MoodlIA CLI Reply ${suffix}`;
  const forumReplyMessage = `<p>MoodlIA CLI reply message ${suffix}</p>`;
  const updatedForumReplySubject = `MoodlIA CLI Updated Reply ${suffix}`;
  const updatedForumReplyMessage = `<p>MoodlIA CLI updated reply message ${suffix}</p>`;
  const glossaryName = `MoodlIA CLI Glossary ${suffix}`;
  const glossaryConcept = `MoodlIA CLI Concept ${suffix}`;
  const updatedGlossaryConcept = `MoodlIA CLI Updated Concept ${suffix}`;
  const glossaryDefinition = `<p>MoodlIA CLI glossary definition ${suffix}</p>`;
  const updatedGlossaryDefinition = `<p>MoodlIA CLI updated glossary definition ${suffix}</p>`;
  const wikiName = `MoodlIA CLI Wiki ${suffix}`;
  const wikiFirstPage = `MoodlIA CLI Wiki Home ${suffix}`;
  const wikiPageTitle = `MoodlIA CLI Wiki Page ${suffix}`;
  const wikiPageContent = `<h3>MoodlIA CLI wiki page ${suffix}</h3><p>Initial generated wiki content.</p>`;
  const updatedWikiPageContent = `<h3>MoodlIA CLI updated wiki page ${suffix}</h3><p>Updated generated wiki content.</p>`;
  let courseId = null;
  let courseCategoryId = null;
  let calendarEventId = null;
  let userUnenrolled = false;
  let groupMemberRemoved = false;
  let groupRemovedFromGrouping = false;
  let groupingDeleted = false;
  let groupDeleted = false;
  let sectionDeleted = false;
  let moduleDeleted = false;
  let duplicatedModuleDeleted = false;
  let assignDeleted = false;
  let bookDeleted = false;
  let labelDeleted = false;
  let urlDeleted = false;
  let forumDeleted = false;
  let glossaryDeleted = false;
  let glossaryEntryDeleted = false;
  let wikiDeleted = false;
  let courseCategoryDeleted = false;
  let calendarEventDeleted = false;

  try {
    const createdCourseCategory = await callCli([
      'create-course-category',
      '--name', courseCategoryName,
      '--visible', 'true'
    ]);

    assert.equal(createdCourseCategory.name, courseCategoryName);
    assert.equal(createdCourseCategory.visible, true);
    assert.equal(typeof createdCourseCategory.category_id, 'number');
    courseCategoryId = createdCourseCategory.category_id;

    const updatedCourseCategory = await callCli([
      'update-course-category',
      '--category-id', String(courseCategoryId),
      '--name', updatedCourseCategoryName,
      '--visible', 'true'
    ]);

    assert.equal(updatedCourseCategory.category_id, courseCategoryId);
    assert.equal(updatedCourseCategory.name, updatedCourseCategoryName);

    const listedCourseCategories = await callCli([
      'get-course-categories',
      '--parent-id', '-1'
    ]);
    assert.ok(
      listedCourseCategories.categories.some((category) =>
        category.category_id === courseCategoryId &&
        category.name === updatedCourseCategoryName
      ),
      'CLI get-course-categories must list the created category'
    );

    const createdCourse = await callCli([
      'create-course',
      '--fullname', createdCourseName,
      '--shortname', createdCourseShortname,
      '--category-id', String(courseCategoryId),
      '--visible', 'false',
      '--summary', createdCourseSummary,
      '--summary-format', 'html',
      '--course-format', 'topics',
      '--start-date', String(courseStart),
      '--end-date', String(courseEnd)
    ]);

    assert.equal(createdCourse.fullname, createdCourseName);
    assert.equal(createdCourse.shortname, createdCourseShortname);
    assert.equal(createdCourse.category_id, courseCategoryId);
    assert.equal(createdCourse.summary_format, 'html');
    assert.equal(createdCourse.format, 'topics');
    assert.equal(createdCourse.start_date, courseStart);
    assert.equal(createdCourse.end_date, courseEnd);
    assert.match(createdCourse.summary, /MoodlIA CLI course summary/);
    assert.equal(typeof createdCourse.course_id, 'number');
    courseId = createdCourse.course_id;

    const updatedCourse = await callCli([
      'update-course',
      '--course-id', String(courseId),
      '--fullname', updatedCourseName,
      '--visible', 'false',
      '--summary', updatedCourseSummary,
      '--summary-format', 'html',
      '--course-format', 'topics',
      '--end-date', String(updatedCourseEnd)
    ]);

    assert.equal(updatedCourse.course_id, courseId);
    assert.equal(updatedCourse.fullname, updatedCourseName);
    assert.equal(updatedCourse.summary_format, 'html');
    assert.equal(updatedCourse.format, 'topics');
    assert.equal(updatedCourse.start_date, courseStart);
    assert.equal(updatedCourse.end_date, updatedCourseEnd);
    assert.match(updatedCourse.summary, /MoodlIA CLI updated course summary/);

    const courseDetails = await callCli([
      'get-course-details',
      '--course-id', String(courseId)
    ]);

    assert.equal(courseDetails.course_id, courseId);
    assert.equal(courseDetails.fullname, updatedCourseName);
    assert.equal(courseDetails.category_id, courseCategoryId);
    assert.equal(courseDetails.visible, false);
    assert.equal(courseDetails.summary_format, 'html');
    assert.equal(courseDetails.format, 'topics');
    assert.equal(courseDetails.start_date, courseStart);
    assert.equal(courseDetails.end_date, updatedCourseEnd);
    assert.match(courseDetails.summary, /MoodlIA CLI updated course summary/);

    const createdCalendarEvent = await callCli([
      'create-calendar-event',
      '--course-id', String(courseId),
      '--name', eventName,
      '--timestart', String(eventStart),
      '--description', eventDescription,
      '--timeduration', '1800'
    ]);

    assert.equal(createdCalendarEvent.course_id, courseId);
    assert.equal(createdCalendarEvent.name, eventName);
    assert.equal(createdCalendarEvent.event_type, 'course');
    assert.equal(createdCalendarEvent.timestart, eventStart);
    assert.equal(createdCalendarEvent.timeduration, 1800);
    assert.equal(typeof createdCalendarEvent.event_id, 'number');
    calendarEventId = createdCalendarEvent.event_id;

    const listedCalendarEvents = await callCli([
      'get-calendar-events',
      '--course-id', String(courseId),
      '--time-from', String(eventStart - 3600),
      '--time-to', String(eventStart + 7200)
    ]);
    assert.ok(
      listedCalendarEvents.events.some((event) =>
        event.event_id === calendarEventId &&
        event.name === eventName
      ),
      'CLI get-calendar-events must list the created event'
    );

    const updatedCalendarEvent = await callCli([
      'update-calendar-event',
      '--course-id', String(courseId),
      '--event-id', String(calendarEventId),
      '--name', updatedEventName,
      '--description', updatedEventDescription,
      '--timestart', String(updatedEventStart),
      '--timeduration', '2700'
    ]);

    assert.equal(updatedCalendarEvent.event_id, calendarEventId);
    assert.equal(updatedCalendarEvent.name, updatedEventName);
    assert.equal(updatedCalendarEvent.timestart, updatedEventStart);
    assert.equal(updatedCalendarEvent.timeduration, 2700);

    const currentUser = await callCli(['get-current-user']);
    assert.equal(typeof currentUser.id, 'number');

    const enrolledUser = await callCli([
      'enrol-user',
      '--course-id', String(courseId),
      '--user-id', String(currentUser.id),
      '--role-archetype', 'student'
    ]);

    assert.equal(enrolledUser.course_id, courseId);
    assert.equal(enrolledUser.user_id, currentUser.id);
    assert.equal(enrolledUser.role_archetype, 'student');
    assert.equal(enrolledUser.enrolled, true);
    assert.ok(enrolledUser.user.roles.includes('student'), 'CLI enrol-user must assign the student role');

    const enrolledUsers = await callCli([
      'get-enrolled-users',
      '--course-id', String(courseId)
    ]);
    assert.ok(
      enrolledUsers.users.some((user) =>
        user.user_id === currentUser.id &&
        user.username === currentUser.username &&
        user.roles.includes('student')
      ),
      'CLI get-enrolled-users must list the enrolled current user'
    );

    const createdGroup = await callCli([
      'create-group',
      '--course-id', String(courseId),
      '--name', groupName,
      '--description', `MoodlIA CLI group description ${suffix}`
    ]);

    assert.equal(createdGroup.course_id, courseId);
    assert.equal(createdGroup.name, groupName);
    assert.equal(typeof createdGroup.group_id, 'number');

    const listedGroups = await callCli([
      'get-groups',
      '--course-id', String(courseId)
    ]);
    assert.ok(
      listedGroups.groups.some((group) => group.group_id === createdGroup.group_id && group.name === groupName),
      'CLI get-groups must list the created group'
    );

    const createdGrouping = await callCli([
      'create-grouping',
      '--course-id', String(courseId),
      '--name', groupingName,
      '--description', groupingDescription
    ]);

    assert.equal(createdGrouping.course_id, courseId);
    assert.equal(createdGrouping.name, groupingName);
    assert.equal(typeof createdGrouping.grouping_id, 'number');

    const listedGroupings = await callCli([
      'get-groupings',
      '--course-id', String(courseId)
    ]);
    assert.ok(
      listedGroupings.groupings.some((grouping) =>
        grouping.grouping_id === createdGrouping.grouping_id &&
        grouping.name === groupingName
      ),
      'CLI get-groupings must list the created grouping'
    );

    const addedGroupToGrouping = await callCli([
      'add-group-to-grouping',
      '--course-id', String(courseId),
      '--grouping-id', String(createdGrouping.grouping_id),
      '--group-id', String(createdGroup.group_id)
    ]);

    assert.equal(addedGroupToGrouping.added, true);
    assert.equal(addedGroupToGrouping.grouping.name, groupingName);
    assert.equal(addedGroupToGrouping.group.name, groupName);

    const updatedGrouping = await callCli([
      'update-grouping',
      '--course-id', String(courseId),
      '--grouping-id', String(createdGrouping.grouping_id),
      '--name', updatedGroupingName,
      '--description', updatedGroupingDescription
    ]);

    assert.equal(updatedGrouping.grouping_id, createdGrouping.grouping_id);
    assert.equal(updatedGrouping.name, updatedGroupingName);
    assert.equal(updatedGrouping.description, updatedGroupingDescription);

    const removedGroupFromGrouping = await callCli([
      'remove-group-from-grouping',
      '--course-id', String(courseId),
      '--grouping-id', String(createdGrouping.grouping_id),
      '--group-id', String(createdGroup.group_id)
    ]);

    assert.equal(removedGroupFromGrouping.removed, true);
    groupRemovedFromGrouping = true;

    const deletedGrouping = await callCli([
      'delete-grouping',
      '--course-id', String(courseId),
      '--grouping-id', String(createdGrouping.grouping_id)
    ]);

    assert.equal(deletedGrouping.deleted, true);
    assert.equal(deletedGrouping.id, createdGrouping.grouping_id);
    groupingDeleted = true;

    const addedGroupMember = await callCli([
      'add-group-member',
      '--course-id', String(courseId),
      '--group-id', String(createdGroup.group_id),
      '--user-id', String(currentUser.id)
    ]);

    assert.equal(addedGroupMember.added, true);
    assert.equal(addedGroupMember.user_id, currentUser.id);

    const listedGroupMembers = await callCli([
      'get-group-members',
      '--course-id', String(courseId),
      '--group-id', String(createdGroup.group_id)
    ]);
    assert.ok(
      listedGroupMembers.members.some((member) =>
        member.user_id === currentUser.id &&
        member.username === currentUser.username
      ),
      'CLI get-group-members must list the added current user'
    );

    const removedGroupMember = await callCli([
      'remove-group-member',
      '--course-id', String(courseId),
      '--group-id', String(createdGroup.group_id),
      '--user-id', String(currentUser.id)
    ]);

    assert.equal(removedGroupMember.removed, true);
    groupMemberRemoved = true;

    const updatedGroup = await callCli([
      'update-group',
      '--course-id', String(courseId),
      '--group-id', String(createdGroup.group_id),
      '--name', updatedGroupName
    ]);

    assert.equal(updatedGroup.group_id, createdGroup.group_id);
    assert.equal(updatedGroup.name, updatedGroupName);

    const deletedGroup = await callCli([
      'delete-group',
      '--course-id', String(courseId),
      '--group-id', String(createdGroup.group_id)
    ]);

    assert.equal(deletedGroup.deleted, true);
    assert.equal(deletedGroup.id, createdGroup.group_id);
    groupDeleted = true;

    const unenrolledUser = await callCli([
      'unenrol-user',
      '--course-id', String(courseId),
      '--user-id', String(currentUser.id)
    ]);

    assert.equal(unenrolledUser.course_id, courseId);
    assert.equal(unenrolledUser.user_id, currentUser.id);
    assert.equal(unenrolledUser.unenrolled, true);
    userUnenrolled = true;

    const createdSection = await callCli([
      'create-section',
      '--course-id', String(courseId),
      '--name', sectionName,
      '--summary', 'Created by MoodlIA CLI automated tests.'
    ]);

    assert.equal(createdSection.course_id, courseId);
    assert.equal(createdSection.name, sectionName);
    assert.equal(typeof createdSection.section_id, 'number');
    assert.equal(typeof createdSection.section_number, 'number');
    assert.equal(createdSection.visible, true);
    assert.match(createdSection.summary, /Created by MoodlIA CLI automated tests\./);

    const updatedSection = await callCli([
      'update-section',
      '--course-id', String(courseId),
      '--section-id', String(createdSection.section_id),
      '--name', updatedSectionName,
      '--summary', 'Updated by MoodlIA CLI automated tests.',
      '--visible', 'false'
    ]);

    assert.equal(updatedSection.section_id, createdSection.section_id);
    assert.equal(updatedSection.name, updatedSectionName);
    assert.equal(updatedSection.visible, false);
    assert.match(updatedSection.summary, /Updated by MoodlIA CLI automated tests\./);

    const reshownSection = await callCli([
      'update-section',
      '--course-id', String(courseId),
      '--section-id', String(createdSection.section_id),
      '--visible', 'true'
    ]);

    assert.equal(reshownSection.section_id, createdSection.section_id);
    assert.equal(reshownSection.visible, true);

    const createdModule = await callCli([
      'create-module',
      '--course-id', String(courseId),
      '--section-number', String(createdSection.section_number),
      '--module-type', 'page',
      '--name', moduleName,
      '--options', JSON.stringify({
        content: '<p>Created by MoodlIA CLI automated tests.</p>',
        visible: true,
        visible_on_course_page: false,
        show_description: true,
        id_number: `moodlia-cli-${suffix.toLowerCase()}`,
        language: 'en',
        group_mode: 'none',
        download_content: false,
        print_intro: true,
        print_last_modified: false
      })
    ]);

    assert.equal(createdModule.module_type, 'page');
    assert.equal(createdModule.name, moduleName);
    assert.equal(createdModule.visible, true);
    assert.equal(typeof createdModule.visible_on_course_page, 'boolean');
    assert.equal(createdModule.download_content, false);
    assert.equal(createdModule.id_number, `moodlia-cli-${suffix.toLowerCase()}`);
    assert.equal(createdModule.language, 'en');
    assert.equal(createdModule.group_mode, 0);
    assert.equal(typeof createdModule.course_module_id, 'number');

    const moduleDetails = await callCli([
      'get-module-details',
      '--course-id', String(courseId),
      '--module-id', String(createdModule.course_module_id)
    ]);

    assert.equal(moduleDetails.course_module_id, createdModule.course_module_id);
    assert.equal(moduleDetails.instance_id, createdModule.instance_id);
    assert.equal(moduleDetails.module_type, 'page');
    assert.equal(moduleDetails.name, moduleName);
    assert.equal(moduleDetails.section_number, createdSection.section_number);
    assert.equal(moduleDetails.visible, true);
    assert.equal(moduleDetails.visible_on_course_page, createdModule.visible_on_course_page);
    assert.equal(moduleDetails.download_content, false);
    assert.equal(moduleDetails.id_number, `moodlia-cli-${suffix.toLowerCase()}`);
    assert.equal(moduleDetails.show_description, true);
    const pageExtra = JSON.parse(moduleDetails.extra_json);
    assert.equal(pageExtra.activity.page_id, createdModule.instance_id);
    assert.ok(
      pageExtra.activity.content.includes('Created by MoodlIA CLI automated tests.'),
      'CLI page details must expose rendered page content'
    );
    assert.ok(pageExtra.activity.content_length > 0, 'CLI page details must expose content length');

    const updatedModule = await callCli([
      'update-module',
      '--course-id', String(courseId),
      '--module-id', String(createdModule.course_module_id),
      '--name', updatedModuleName,
      '--visible', 'false',
      '--options', JSON.stringify({
        id_number: `moodlia-cli-updated-${suffix.toLowerCase()}`,
        tags: [`moodlia-cli-updated-${suffix.toLowerCase()}`],
        download_content: true
      })
    ]);

    assert.equal(updatedModule.course_module_id, createdModule.course_module_id);
    assert.equal(updatedModule.name, updatedModuleName);
    assert.equal(updatedModule.visible, false);
    assert.equal(updatedModule.visible_on_course_page, createdModule.visible_on_course_page);
    assert.equal(updatedModule.download_content, true);
    assert.equal(updatedModule.id_number, `moodlia-cli-updated-${suffix.toLowerCase()}`);

    const hiddenCourseContents = await callCli([
      'get-course-contents',
      '--course-id', String(courseId)
    ]);
    const hiddenModule = hiddenCourseContents.sections
      .flatMap((section) => section.modules)
      .find((module) => module.course_module_id === createdModule.course_module_id);
    assert.equal(hiddenModule.visible, false);
    assert.equal(hiddenModule.visible_on_course_page, updatedModule.visible_on_course_page);

    const reshownModule = await callCli([
      'update-module',
      '--course-id', String(courseId),
      '--module-id', String(createdModule.course_module_id),
      '--visible', 'true'
    ]);
    assert.equal(reshownModule.visible, true);
    assert.equal(reshownModule.visible_on_course_page, hiddenModule.visible_on_course_page);

    const coursePageModule = await callCli([
      'update-module',
      '--course-id', String(courseId),
      '--module-id', String(createdModule.course_module_id),
      '--options', JSON.stringify({
        visible_on_course_page: true
      })
    ]);
    assert.equal(coursePageModule.visible, true);
    assert.equal(coursePageModule.visible_on_course_page, true);

    const duplicatedModule = await callCli([
      'duplicate-module',
      '--course-id', String(courseId),
      '--module-id', String(createdModule.course_module_id),
      '--section-number', String(createdSection.section_number),
      '--name', duplicatedModuleName
    ]);

    assert.notEqual(duplicatedModule.course_module_id, createdModule.course_module_id);
    assert.equal(duplicatedModule.module_type, 'page');
    assert.equal(duplicatedModule.name, duplicatedModuleName);
    assert.match(duplicatedModule.url, /\/mod\/page\/view\.php\?id=/);

    const movedDuplicatedModule = await callCli([
      'move-module',
      '--course-id', String(courseId),
      '--module-id', String(duplicatedModule.course_module_id),
      '--section-number', '0'
    ]);

    assert.equal(movedDuplicatedModule.course_module_id, duplicatedModule.course_module_id);
    assert.equal(movedDuplicatedModule.name, duplicatedModuleName);

    const courseContentsWithMovedDuplicate = await callCli([
      'get-course-contents',
      '--course-id', String(courseId)
    ]);
    const generalSectionWithMovedDuplicate = courseContentsWithMovedDuplicate.sections
      .find((section) => section.section_number === 0);
    const duplicatedContentModule = generalSectionWithMovedDuplicate?.modules
      .find((module) => module.course_module_id === duplicatedModule.course_module_id);
    assert.equal(duplicatedContentModule?.name, duplicatedModuleName);

    const deletedDuplicatedModule = await callCli([
      'delete-module',
      '--course-id', String(courseId),
      '--module-id', String(duplicatedModule.course_module_id)
    ]);

    assert.equal(deletedDuplicatedModule.deleted, true);
    assert.equal(deletedDuplicatedModule.id, duplicatedModule.course_module_id);
    duplicatedModuleDeleted = true;

    const deletedModule = await callCli([
      'delete-module',
      '--course-id', String(courseId),
      '--module-id', String(createdModule.course_module_id)
    ]);

    assert.equal(deletedModule.deleted, true);
    assert.equal(deletedModule.id, createdModule.course_module_id);
    moduleDeleted = true;

    const createdAssign = await callCli([
      'create-module',
      '--course-id', String(courseId),
      '--section-number', String(createdSection.section_number),
      '--module-type', 'assign',
      '--name', assignName,
      '--options', JSON.stringify({
        intro: `<p>${assignIntro}</p>`,
        activity: `<p>CLI assignment instructions ${suffix}</p>`,
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
      })
    ]);

    assert.equal(createdAssign.module_type, 'assign');
    assert.equal(createdAssign.name, assignName);
    assert.equal(typeof createdAssign.course_module_id, 'number');
    assert.match(createdAssign.url, /\/mod\/assign\/view\.php\?id=/);

    const assignDetails = await callCli([
      'get-module-details',
      '--course-id', String(courseId),
      '--module-id', String(createdAssign.course_module_id)
    ]);
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

    const updatedAssign = await callCli([
      'update-module',
      '--course-id', String(courseId),
      '--module-id', String(createdAssign.course_module_id),
      '--name', updatedAssignName,
      '--options', JSON.stringify({
        group_mode: 'visible_groups'
      })
    ]);

    assert.equal(updatedAssign.course_module_id, createdAssign.course_module_id);
    assert.equal(updatedAssign.name, updatedAssignName);
    assert.equal(updatedAssign.group_mode, 2);

    const assignmentSubmitter = await callCli([
      'enrol-user',
      '--course-id', String(courseId),
      '--user-id', String(currentUser.id),
      '--role-archetype', 'student'
    ]);
    assert.equal(assignmentSubmitter.enrolled, true);
    userUnenrolled = false;

    const savedAssignmentSubmission = await callCli([
      'save-assignment-submission',
      '--course-id', String(courseId),
      '--module-id', String(createdAssign.course_module_id),
      '--online-text', `<p>${assignmentSubmissionText}</p>`
    ]);
    assert.equal(savedAssignmentSubmission.course_id, courseId);
    assert.equal(savedAssignmentSubmission.module_id, createdAssign.course_module_id);
    assert.equal(savedAssignmentSubmission.assignment_id, createdAssign.instance_id);
    assert.equal(savedAssignmentSubmission.submitted, false);
    assert.match(savedAssignmentSubmission.online_text, new RegExp(assignmentSubmissionText));

    const listedAssignmentSubmission = await callCli([
      'get-assignment-submission-status',
      '--course-id', String(courseId),
      '--module-id', String(createdAssign.course_module_id)
    ]);
    assert.equal(listedAssignmentSubmission.submission_id, savedAssignmentSubmission.submission_id);
    assert.match(listedAssignmentSubmission.online_text, new RegExp(assignmentSubmissionText));

    const submittedAssignment = await callCli([
      'submit-assignment-for-grading',
      '--course-id', String(courseId),
      '--module-id', String(createdAssign.course_module_id),
      '--accept-submission-statement', 'true'
    ]);
    assert.equal(submittedAssignment.submitted, true);
    assert.equal(submittedAssignment.status, 'submitted');
    assert.match(submittedAssignment.online_text, new RegExp(assignmentSubmissionText));

    const gradedAssignment = await callCli([
      'save-assignment-grade',
      '--course-id', String(courseId),
      '--module-id', String(createdAssign.course_module_id),
      '--user-id', String(currentUser.id),
      '--grade', String(assignmentGrade),
      '--feedback-comment', `<p>${assignmentFeedbackComment}</p>`
    ]);
    assert.equal(gradedAssignment.submitted, true);
    assert.equal(gradedAssignment.graded, true);
    assert.equal(gradedAssignment.grade, assignmentGrade);
    assert.equal(gradedAssignment.grader_id, currentUser.id);
    assert.match(gradedAssignment.feedback_comment, new RegExp(assignmentFeedbackComment));

    const gradeItems = await callCli([
      'get-grade-items',
      '--course-id', String(courseId)
    ]);
    assert.ok(
      gradeItems.items.some((item) => item.name === updatedAssignName),
      'CLI gradebook items should include the generated assignment.'
    );

    const userGrades = await callCli([
      'get-user-grades',
      '--course-id', String(courseId),
      '--user-id', String(currentUser.id)
    ]);
    assert.equal(userGrades.user_id, currentUser.id);
    const assignmentGradeItem = userGrades.items.find((item) => item.course_module_id === createdAssign.course_module_id);
    assert.ok(assignmentGradeItem, 'CLI user grades should include the generated assignment grade item.');
    assert.equal(assignmentGradeItem.name, updatedAssignName);
    assert.equal(assignmentGradeItem.grade_raw, assignmentGrade);

    const assignmentUserCleanup = await callCli([
      'unenrol-user',
      '--course-id', String(courseId),
      '--user-id', String(currentUser.id)
    ]);
    assert.equal(assignmentUserCleanup.unenrolled, true);
    userUnenrolled = true;

    const deletedAssign = await callCli([
      'delete-module',
      '--course-id', String(courseId),
      '--module-id', String(createdAssign.course_module_id)
    ]);

    assert.equal(deletedAssign.deleted, true);
    assert.equal(deletedAssign.id, createdAssign.course_module_id);
    assignDeleted = true;

    const createdBook = await callCli([
      'create-module',
      '--course-id', String(courseId),
      '--section-number', String(createdSection.section_number),
      '--module-type', 'book',
      '--name', bookName,
      '--options', JSON.stringify({
        intro: '<p>Created by MoodlIA CLI lifecycle tests.</p>',
        numbering: 'bullets',
        custom_titles: false
      })
    ]);

    assert.equal(createdBook.module_type, 'book');
    assert.equal(createdBook.name, bookName);
    assert.equal(typeof createdBook.course_module_id, 'number');
    assert.match(createdBook.url, /\/mod\/book\/view\.php\?id=/);

    const listedBookChapters = await callCli([
      'get-book-chapters',
      '--course-id', String(courseId),
      '--module-id', String(createdBook.course_module_id),
      '--include-content', 'false'
    ]);

    assert.equal(listedBookChapters.module_id, createdBook.course_module_id);
    assert.equal(listedBookChapters.book_id, createdBook.instance_id);
    assert.equal(listedBookChapters.count, listedBookChapters.chapters.length);

    const viewedBook = await callCli([
      'view-book',
      '--course-id', String(courseId),
      '--module-id', String(createdBook.course_module_id)
    ]);

    assert.equal(viewedBook.module_id, createdBook.course_module_id);
    assert.equal(viewedBook.book_id, createdBook.instance_id);
    assert.equal(viewedBook.viewed, true);
    assert.equal(Array.isArray(viewedBook.warnings), true);

    const bookDetails = await callCli([
      'get-module-details',
      '--course-id', String(courseId),
      '--module-id', String(createdBook.course_module_id)
    ]);
    const bookExtra = JSON.parse(bookDetails.extra_json);
    assert.equal(bookDetails.module_type, 'book');
    assert.equal(bookExtra.activity.book_id, createdBook.instance_id);
    assert.equal(bookExtra.activity.chapter_count, listedBookChapters.count);
    assert.equal(Array.isArray(bookExtra.activity.chapters), true);

    const deletedBook = await callCli([
      'delete-module',
      '--course-id', String(courseId),
      '--module-id', String(createdBook.course_module_id)
    ]);

    assert.equal(deletedBook.deleted, true);
    assert.equal(deletedBook.id, createdBook.course_module_id);
    bookDeleted = true;

    const createdLabel = await callCli([
      'create-module',
      '--course-id', String(courseId),
      '--section-number', String(createdSection.section_number),
      '--module-type', 'label',
      '--name', labelName,
      '--options', JSON.stringify({
        content: `<p>${labelText}</p>`
      })
    ]);

    assert.equal(createdLabel.module_type, 'label');
    assert.equal(createdLabel.name, labelName);
    assert.equal(typeof createdLabel.course_module_id, 'number');
    assert.equal(createdLabel.url, '');

    const labelDetails = await callCli([
      'get-module-details',
      '--course-id', String(courseId),
      '--module-id', String(createdLabel.course_module_id)
    ]);
    const labelExtra = JSON.parse(labelDetails.extra_json);
    assert.equal(labelDetails.module_type, 'label');
    assert.equal(labelExtra.activity.label_id, createdLabel.instance_id);
    assert.ok(labelExtra.activity.content.includes(labelText), 'CLI label details must expose rendered label content');
    assert.ok(labelExtra.activity.content_length > 0, 'CLI label details must expose content length');

    const deletedLabel = await callCli([
      'delete-module',
      '--course-id', String(courseId),
      '--module-id', String(createdLabel.course_module_id)
    ]);

    assert.equal(deletedLabel.deleted, true);
    assert.equal(deletedLabel.id, createdLabel.course_module_id);
    labelDeleted = true;

    const createdUrl = await callCli([
      'create-module',
      '--course-id', String(courseId),
      '--section-number', String(createdSection.section_number),
      '--module-type', 'url',
      '--name', urlName,
      '--options', JSON.stringify({
        external_url: externalUrl,
        intro: '<p>Created by MoodlIA CLI lifecycle tests.</p>',
        display: 'popup',
        print_intro: false,
        popup_width: 900,
        popup_height: 600
      })
    ]);

    assert.equal(createdUrl.module_type, 'url');
    assert.equal(createdUrl.name, urlName);
    assert.equal(typeof createdUrl.course_module_id, 'number');
    assert.match(createdUrl.url, /\/mod\/url\/view\.php\?id=/);

    const updatedUrl = await callCli([
      'update-module',
      '--course-id', String(courseId),
      '--module-id', String(createdUrl.course_module_id),
      '--name', updatedUrlName
    ]);

    assert.equal(updatedUrl.course_module_id, createdUrl.course_module_id);
    assert.equal(updatedUrl.name, updatedUrlName);

    const urlDetails = await callCli([
      'get-module-details',
      '--course-id', String(courseId),
      '--module-id', String(createdUrl.course_module_id)
    ]);
    const urlExtra = JSON.parse(urlDetails.extra_json);
    assert.equal(urlDetails.module_type, 'url');
    assert.equal(urlExtra.activity.url_id, createdUrl.instance_id);
    if (urlExtra.activity.external_url !== '') {
      assert.equal(urlExtra.activity.external_url, externalUrl);
    }
    if (urlExtra.activity.popup_width > 0) {
      assert.equal(urlExtra.activity.popup_width, 900);
    }

    const deletedUrl = await callCli([
      'delete-module',
      '--course-id', String(courseId),
      '--module-id', String(createdUrl.course_module_id)
    ]);

    assert.equal(deletedUrl.deleted, true);
    assert.equal(deletedUrl.id, createdUrl.course_module_id);
    urlDeleted = true;

    const createdForum = await callCli([
      'create-module',
      '--course-id', String(courseId),
      '--section-number', String(createdSection.section_number),
      '--module-type', 'forum',
      '--name', forumName,
      '--options', JSON.stringify({
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
      })
    ]);

    assert.equal(createdForum.module_type, 'forum');
    assert.equal(createdForum.name, forumName);
    assert.equal(typeof createdForum.course_module_id, 'number');
    assert.match(createdForum.url, /\/mod\/forum\/view\.php\?id=/);

    const createdDiscussion = await callCli([
      'create-forum-discussion',
      '--course-id', String(courseId),
      '--module-id', String(createdForum.course_module_id),
      '--name', forumDiscussionName,
      '--message', forumDiscussionMessage
    ]);

    assert.equal(createdDiscussion.course_id, courseId);
    assert.equal(createdDiscussion.module_id, createdForum.course_module_id);
    assert.equal(createdDiscussion.name, forumDiscussionName);
    assert.equal(typeof createdDiscussion.discussion_id, 'number');
    assert.equal(typeof createdDiscussion.first_post_id, 'number');

    const listedDiscussions = await callCli([
      'get-forum-discussions',
      '--course-id', String(courseId),
      '--module-id', String(createdForum.course_module_id)
    ]);
    assert.ok(
      listedDiscussions.discussions.some((discussion) =>
        discussion.discussion_id === createdDiscussion.discussion_id &&
        discussion.name === forumDiscussionName
      ),
      'CLI get-forum-discussions must list the created discussion'
    );

    const listedInitialPosts = await callCli([
      'get-forum-discussion-posts',
      '--course-id', String(courseId),
      '--module-id', String(createdForum.course_module_id),
      '--discussion-id', String(createdDiscussion.discussion_id)
    ]);
    assert.ok(
      listedInitialPosts.posts.some((post) =>
        post.post_id === createdDiscussion.first_post_id &&
        post.subject === forumDiscussionName
      ),
      'CLI get-forum-discussion-posts must include the first post'
    );

    const createdReply = await callCli([
      'create-forum-discussion-post',
      '--course-id', String(courseId),
      '--module-id', String(createdForum.course_module_id),
      '--discussion-id', String(createdDiscussion.discussion_id),
      '--parent-post-id', String(createdDiscussion.first_post_id),
      '--subject', forumReplySubject,
      '--message', forumReplyMessage
    ]);

    assert.equal(createdReply.discussion_id, createdDiscussion.discussion_id);
    assert.equal(createdReply.parent_post_id, createdDiscussion.first_post_id);
    assert.equal(createdReply.subject, forumReplySubject);

    const updatedReply = await callCli([
      'update-forum-discussion-post',
      '--course-id', String(courseId),
      '--module-id', String(createdForum.course_module_id),
      '--discussion-id', String(createdDiscussion.discussion_id),
      '--post-id', String(createdReply.post_id),
      '--subject', updatedForumReplySubject,
      '--message', updatedForumReplyMessage
    ]);

    assert.equal(updatedReply.post_id, createdReply.post_id);
    assert.equal(updatedReply.subject, updatedForumReplySubject);

    const listedUpdatedPosts = await callCli([
      'get-forum-discussion-posts',
      '--course-id', String(courseId),
      '--module-id', String(createdForum.course_module_id),
      '--discussion-id', String(createdDiscussion.discussion_id)
    ]);
    const forumDetails = await callCli([
      'get-module-details',
      '--course-id', String(courseId),
      '--module-id', String(createdForum.course_module_id)
    ]);
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
      'CLI forum module details must include the created discussion summary'
    );

    const updatedForum = await callCli([
      'update-module',
      '--course-id', String(courseId),
      '--module-id', String(createdForum.course_module_id),
      '--name', updatedForumName
    ]);

    assert.equal(updatedForum.course_module_id, createdForum.course_module_id);
    assert.equal(updatedForum.name, updatedForumName);

    const deletedForum = await callCli([
      'delete-module',
      '--course-id', String(courseId),
      '--module-id', String(createdForum.course_module_id)
    ]);

    assert.equal(deletedForum.deleted, true);
    assert.equal(deletedForum.id, createdForum.course_module_id);
    forumDeleted = true;

    const createdGlossary = await callCli([
      'create-module',
      '--course-id', String(courseId),
      '--section-number', String(createdSection.section_number),
      '--module-type', 'glossary',
      '--name', glossaryName,
      '--options', JSON.stringify({
        intro: '<p>CLI glossary activity created by MoodlIA automated tests.</p>',
        display_format: 'dictionary',
        allow_comments: true
      })
    ]);

    assert.equal(createdGlossary.module_type, 'glossary');
    assert.equal(createdGlossary.name, glossaryName);
    assert.equal(typeof createdGlossary.course_module_id, 'number');
    assert.match(createdGlossary.url, /\/mod\/glossary\/view\.php\?id=/);

    const createdGlossaryEntry = await callCli([
      'create-glossary-entry',
      '--course-id', String(courseId),
      '--module-id', String(createdGlossary.course_module_id),
      '--concept', glossaryConcept,
      '--definition', glossaryDefinition,
      '--definition-format', 'html',
      '--options', JSON.stringify({
        aliases: ['moodlia-cli-glossary'],
        usedynalink: true
      })
    ]);

    assert.equal(createdGlossaryEntry.module_id, createdGlossary.course_module_id);
    assert.equal(createdGlossaryEntry.concept, glossaryConcept);
    assert.match(createdGlossaryEntry.definition, new RegExp(suffix));

    const searchedGlossaryEntries = await callCli([
      'search-glossary-entries',
      '--course-id', String(courseId),
      '--module-id', String(createdGlossary.course_module_id),
      '--query', glossaryConcept,
      '--full-search', 'true',
      '--include-not-approved', 'true'
    ]);
    assert.ok(
      searchedGlossaryEntries.entries.some((entry) => entry.entry_id === createdGlossaryEntry.entry_id),
      'CLI search-glossary-entries must list the created entry'
    );

    const updatedGlossaryEntry = await callCli([
      'update-glossary-entry',
      '--course-id', String(courseId),
      '--module-id', String(createdGlossary.course_module_id),
      '--entry-id', String(createdGlossaryEntry.entry_id),
      '--concept', updatedGlossaryConcept,
      '--definition', updatedGlossaryDefinition,
      '--definition-format', 'html',
      '--options', JSON.stringify({
        aliases: ['moodlia-cli-updated-glossary'],
        usedynalink: false
      })
    ]);

    assert.equal(updatedGlossaryEntry.entry_id, createdGlossaryEntry.entry_id);
    assert.equal(updatedGlossaryEntry.concept, updatedGlossaryConcept);
    assert.match(updatedGlossaryEntry.definition, /updated glossary definition/);

    const glossaryDetails = await callCli([
      'get-module-details',
      '--course-id', String(courseId),
      '--module-id', String(createdGlossary.course_module_id)
    ]);
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
      'CLI glossary module details must include the updated entry summary'
    );

    const deletedGlossaryEntry = await callCli([
      'delete-glossary-entry',
      '--course-id', String(courseId),
      '--module-id', String(createdGlossary.course_module_id),
      '--entry-id', String(createdGlossaryEntry.entry_id)
    ]);

    assert.equal(deletedGlossaryEntry.deleted, true);
    assert.equal(deletedGlossaryEntry.id, createdGlossaryEntry.entry_id);
    glossaryEntryDeleted = true;

    const deletedGlossary = await callCli([
      'delete-module',
      '--course-id', String(courseId),
      '--module-id', String(createdGlossary.course_module_id)
    ]);

    assert.equal(deletedGlossary.deleted, true);
    assert.equal(deletedGlossary.id, createdGlossary.course_module_id);
    glossaryDeleted = true;

    const createdWiki = await callCli([
      'create-module',
      '--course-id', String(courseId),
      '--section-number', String(createdSection.section_number),
      '--module-type', 'wiki',
      '--name', wikiName,
      '--options', JSON.stringify({
        intro: '<p>CLI wiki activity created by MoodlIA automated tests.</p>',
        first_page_title: wikiFirstPage,
        wiki_mode: 'collaborative',
        default_format: 'html'
      })
    ]);

    assert.equal(createdWiki.module_type, 'wiki');
    assert.equal(createdWiki.name, wikiName);
    assert.equal(typeof createdWiki.course_module_id, 'number');
    assert.match(createdWiki.url, /\/mod\/wiki\/view\.php\?id=/);

    const createdWikiPage = await callCli([
      'create-wiki-page',
      '--course-id', String(courseId),
      '--module-id', String(createdWiki.course_module_id),
      '--title', wikiPageTitle,
      '--content', wikiPageContent,
      '--content-format', 'html'
    ]);

    assert.equal(createdWikiPage.module_id, createdWiki.course_module_id);
    assert.equal(createdWikiPage.title, wikiPageTitle);
    assert.match(createdWikiPage.content, /Initial generated wiki content/);

    const listedWikiPages = await callCli([
      'get-wiki-pages',
      '--course-id', String(courseId),
      '--module-id', String(createdWiki.course_module_id),
      '--sort-by', 'title',
      '--sort-direction', 'ASC',
      '--include-content', 'true'
    ]);
    assert.ok(
      listedWikiPages.pages.some((page) => page.page_id === createdWikiPage.page_id),
      'CLI get-wiki-pages must list the created wiki page'
    );

    const updatedWikiPage = await callCli([
      'update-wiki-page',
      '--course-id', String(courseId),
      '--module-id', String(createdWiki.course_module_id),
      '--page-id', String(createdWikiPage.page_id),
      '--content', updatedWikiPageContent
    ]);

    assert.equal(updatedWikiPage.page_id, createdWikiPage.page_id);
    assert.match(updatedWikiPage.content, /Updated generated wiki content/);

    const wikiDetails = await callCli([
      'get-module-details',
      '--course-id', String(courseId),
      '--module-id', String(createdWiki.course_module_id)
    ]);
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
      'CLI wiki module details must include the updated page summary'
    );

    const deletedWiki = await callCli([
      'delete-module',
      '--course-id', String(courseId),
      '--module-id', String(createdWiki.course_module_id)
    ]);

    assert.equal(deletedWiki.deleted, true);
    assert.equal(deletedWiki.id, createdWiki.course_module_id);
    wikiDeleted = true;

    const deletedSection = await callCli([
      'delete-section',
      '--course-id', String(courseId),
      '--section-id', String(createdSection.section_id),
      '--delete-mode', 'delete'
    ]);

    assert.equal(deletedSection.deleted, true);
    assert.equal(deletedSection.id, createdSection.section_id);
    sectionDeleted = true;

    const deletedCalendarEvent = await callCli([
      'delete-calendar-event',
      '--course-id', String(courseId),
      '--event-id', String(calendarEventId)
    ]);

    assert.equal(deletedCalendarEvent.deleted, true);
    assert.equal(deletedCalendarEvent.id, calendarEventId);
    calendarEventDeleted = true;
    calendarEventId = null;

    const deletedCourse = await callCli([
      'delete-course',
      '--course-id', String(courseId)
    ]);

    assert.equal(deletedCourse.deleted, true);
    assert.equal(deletedCourse.id, courseId);
    courseId = null;

    const deletedCourseCategory = await callCli([
      'delete-course-category',
      '--category-id', String(courseCategoryId)
    ]);

    assert.equal(deletedCourseCategory.deleted, true);
    assert.equal(deletedCourseCategory.id, courseCategoryId);
    courseCategoryDeleted = true;
    courseCategoryId = null;
  } catch (error) {
    if (courseId) {
      console.error(`Generated CLI course left in Moodle for inspection: ${courseId}`);
      if (!moduleDeleted) {
        console.error('CLI module cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!duplicatedModuleDeleted) {
        console.error('CLI duplicated module cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!userUnenrolled) {
        console.error('CLI user unenrolment cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!groupMemberRemoved) {
        console.error('CLI group member cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!groupRemovedFromGrouping) {
        console.error('CLI grouping membership cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!groupingDeleted) {
        console.error('CLI grouping cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!groupDeleted) {
        console.error('CLI group cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!assignDeleted) {
        console.error('CLI assignment cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!bookDeleted) {
        console.error('CLI book cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!labelDeleted) {
        console.error('CLI label cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!urlDeleted) {
        console.error('CLI URL cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!forumDeleted) {
        console.error('CLI forum cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!glossaryEntryDeleted) {
        console.error('CLI glossary entry cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!glossaryDeleted) {
        console.error('CLI glossary cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!wikiDeleted) {
        console.error('CLI wiki cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!sectionDeleted) {
        console.error('CLI section cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!calendarEventDeleted) {
        console.error('CLI calendar event cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
    }
    if (calendarEventId && !calendarEventDeleted) {
      console.error(`Generated CLI calendar event left in Moodle for inspection: ${calendarEventId}`);
    }
    if (courseCategoryId && !courseCategoryDeleted) {
      console.error(`Generated CLI course category left in Moodle for inspection: ${courseCategoryId}`);
    }
    throw error;
  }
});

test('CLI generated file, question, and quiz lifecycle works', { skip: !hasCliConfig }, async () => {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const courseName = `MoodlIA CLI Content Course ${suffix}`;
  const courseShortname = `moodlia-cli-content-${suffix}`;
  const sectionName = `MoodlIA CLI Content Section ${suffix}`;
  const folderName = `MoodlIA CLI Folder ${suffix}`;
  const filename = `moodlia-cli-${suffix}.txt`;
  const categoryName = `MoodlIA CLI Questions ${suffix}`;
  const updatedCategoryName = `MoodlIA CLI Updated Questions ${suffix}`;
  const emptyCategoryName = `MoodlIA CLI Empty Questions ${suffix}`;
  const moveTargetCategoryName = `MoodlIA CLI Move Target Questions ${suffix}`;
  const privateCategoryName = `MoodlIA CLI Private Questions ${suffix}`;
  const questionName = `MoodlIA CLI True False ${suffix}`;
  const updatedQuestionName = `MoodlIA CLI Updated True False ${suffix}`;
  const movableQuestionName = `MoodlIA CLI Movable Question ${suffix}`;
  const shortAnswerName = `MoodlIA CLI Short Answer ${suffix}`;
  const updatedShortAnswerName = `MoodlIA CLI Updated Short Answer ${suffix}`;
  const multichoiceName = `MoodlIA CLI Multichoice ${suffix}`;
  const updatedMultichoiceName = `MoodlIA CLI Updated Multichoice ${suffix}`;
  const numericalName = `MoodlIA CLI Numerical ${suffix}`;
  const updatedNumericalName = `MoodlIA CLI Updated Numerical ${suffix}`;
  const matchingName = `MoodlIA CLI Matching ${suffix}`;
  const updatedMatchingName = `MoodlIA CLI Updated Matching ${suffix}`;
  const essayName = `MoodlIA CLI Essay ${suffix}`;
  const updatedEssayName = `MoodlIA CLI Updated Essay ${suffix}`;
  const deletedQuestionName = `MoodlIA CLI Deleted Question ${suffix}`;
  const privateQuestionName = `MoodlIA CLI Private True False ${suffix}`;
  const removableQuizQuestionName = `MoodlIA CLI Removable Quiz Question ${suffix}`;
  const quizName = `MoodlIA CLI Quiz ${suffix}`;
  let courseId = null;
  let sectionDeleted = false;
  let folderDeleted = false;
  let fileDeleted = false;
  let emptyCategoryDeleted = false;
  let quizDeleted = false;

  try {
    const currentUser = await callCli(['get-current-user']);
    assert.equal(typeof currentUser.id, 'number');

    const createdCourse = await callCli([
      'create-course',
      '--fullname', courseName,
      '--shortname', courseShortname,
      '--visible', 'false'
    ]);

    assert.equal(createdCourse.fullname, courseName);
    assert.equal(createdCourse.shortname, courseShortname);
    assert.equal(typeof createdCourse.course_id, 'number');
    courseId = createdCourse.course_id;

    const createdSection = await callCli([
      'create-section',
      '--course-id', String(courseId),
      '--name', sectionName,
      '--summary', 'Created by MoodlIA CLI content lifecycle tests.'
    ]);

    assert.equal(createdSection.course_id, courseId);
    assert.equal(createdSection.name, sectionName);
    assert.equal(typeof createdSection.section_id, 'number');
    assert.equal(typeof createdSection.section_number, 'number');

    const createdFolder = await callCli([
      'create-module',
      '--course-id', String(courseId),
      '--section-number', String(createdSection.section_number),
      '--module-type', 'folder',
      '--name', folderName,
      '--options', JSON.stringify({
        display: 'course',
        show_expanded: false,
        show_download_folder: false,
        force_download: true
      })
    ]);

    assert.equal(createdFolder.module_type, 'folder');
    assert.equal(createdFolder.name, folderName);
    assert.equal(typeof createdFolder.course_module_id, 'number');

    const uploadedFile = await callCli([
      'upload-folder-file',
      '--course-id', String(courseId),
      '--module-id', String(createdFolder.course_module_id),
      '--filename', filename,
      '--upload-reference', Buffer.from(`Created by MoodlIA CLI ${suffix}`, 'utf8').toString('base64')
    ]);

    assert.equal(uploadedFile.filename, filename);
    assert.equal(typeof uploadedFile.file_id, 'number');

    const listedFolderFiles = await callCli([
      'get-folder-files',
      '--course-id', String(courseId),
      '--module-id', String(createdFolder.course_module_id)
    ]);
    assert.ok(
      listedFolderFiles.files.some((file) => file.file_id === uploadedFile.file_id && file.filename === filename),
      'CLI uploaded file must be present in folder file listing'
    );

    const folderDetails = await callCli([
      'get-module-details',
      '--course-id', String(courseId),
      '--module-id', String(createdFolder.course_module_id)
    ]);
    const folderExtra = JSON.parse(folderDetails.extra_json);
    assert.equal(folderDetails.module_type, 'folder');
    assert.equal(folderExtra.activity.folder_id, createdFolder.instance_id);
    assert.equal(folderExtra.activity.file_count, listedFolderFiles.files.length);
    assert.ok(
      folderExtra.activity.files.some((file) => file.file_id === uploadedFile.file_id && file.filename === filename),
      'CLI folder details must expose uploaded file summaries'
    );

    const downloadedFile = await callCli([
      'download-folder-file',
      '--course-id', String(courseId),
      '--module-id', String(createdFolder.course_module_id),
      '--file-id', String(uploadedFile.file_id)
    ]);

    assert.equal(downloadedFile.file_id, uploadedFile.file_id);
    assert.equal(downloadedFile.filename, filename);

    const deletedFile = await callCli([
      'delete-folder-file',
      '--course-id', String(courseId),
      '--module-id', String(createdFolder.course_module_id),
      '--file-id', String(uploadedFile.file_id)
    ]);

    assert.equal(deletedFile.deleted, true);
    assert.equal(deletedFile.id, uploadedFile.file_id);
    fileDeleted = true;

    const deletedFolder = await callCli([
      'delete-module',
      '--course-id', String(courseId),
      '--module-id', String(createdFolder.course_module_id)
    ]);

    assert.equal(deletedFolder.deleted, true);
    assert.equal(deletedFolder.id, createdFolder.course_module_id);
    folderDeleted = true;

    const createdCategory = await callCli([
      'create-question-category',
      '--course-id', String(courseId),
      '--name', categoryName,
      '--description', 'Created by MoodlIA CLI content lifecycle tests.'
    ]);

    assert.equal(createdCategory.name, categoryName);
    assert.equal(typeof createdCategory.category_id, 'number');
    assert.equal(createdCategory.bank_scope, 'course_shared');
    assert.equal(typeof createdCategory.question_bank_module_id, 'number');
    assert.equal(createdCategory.quiz_module_id, null);

    const updatedCategory = await callCli([
      'update-question-category',
      '--category-id', String(createdCategory.category_id),
      '--context-id', String(createdCategory.context_id),
      '--name', updatedCategoryName,
      '--description', 'Updated by MoodlIA CLI content lifecycle tests.'
    ]);

    assert.equal(updatedCategory.category_id, createdCategory.category_id);
    assert.equal(updatedCategory.name, updatedCategoryName);

    const emptyCategory = await callCli([
      'create-question-category',
      '--course-id', String(courseId),
      '--name', emptyCategoryName
    ]);

    assert.equal(emptyCategory.bank_scope, 'course_shared');
    assert.equal(typeof emptyCategory.question_bank_module_id, 'number');
    assert.equal(emptyCategory.quiz_module_id, null);

    const deletedEmptyCategory = await callCli([
      'delete-question-category',
      '--category-id', String(emptyCategory.category_id),
      '--delete-mode', 'delete'
    ]);

    assert.equal(deletedEmptyCategory.deleted, true);
    assert.equal(deletedEmptyCategory.id, emptyCategory.category_id);
    emptyCategoryDeleted = true;

    const createdQuestion = await callCli([
      'create-question',
      '--category-id', String(createdCategory.category_id),
      '--context-id', String(createdCategory.context_id),
      '--question-type', 'truefalse',
      '--name', questionName,
      '--question-text', '<p>Is this question generated by the MoodlIA CLI?</p>',
      '--options', JSON.stringify({
        correct_answer: true,
        feedback_true: 'Correct.',
        feedback_false: 'Incorrect.'
      })
    ]);

    assert.equal(createdQuestion.category_id, createdCategory.category_id);
    assert.equal(createdQuestion.question_type, 'truefalse');
    assert.equal(createdQuestion.name, questionName);
    assert.equal(typeof createdQuestion.question_id, 'number');

    const updatedQuestion = await callCli([
      'update-question',
      '--question-id', String(createdQuestion.question_id),
      '--name', updatedQuestionName,
      '--question-text', '<p>Was this question updated by the MoodlIA CLI?</p>',
      '--options', JSON.stringify({
        correct_answer: false,
        feedback_true: 'No longer correct.',
        feedback_false: 'Correct after update.'
      })
    ]);

    assert.equal(updatedQuestion.question_type, 'truefalse');
    assert.equal(updatedQuestion.name, updatedQuestionName);
    assert.equal(typeof updatedQuestion.question_id, 'number');

    const createdShortAnswer = await callCli([
      'create-question',
      '--category-id', String(createdCategory.category_id),
      '--context-id', String(createdCategory.context_id),
      '--question-type', 'shortanswer',
      '--name', shortAnswerName,
      '--question-text', '<p>Write the keyword generated by the MoodlIA CLI.</p>',
      '--options', JSON.stringify({
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
      })
    ]);

    assert.equal(createdShortAnswer.category_id, createdCategory.category_id);
    assert.equal(createdShortAnswer.question_type, 'shortanswer');
    assert.equal(createdShortAnswer.name, shortAnswerName);
    assert.equal(typeof createdShortAnswer.question_id, 'number');

    const updatedShortAnswer = await callCli([
      'update-question',
      '--question-id', String(createdShortAnswer.question_id),
      '--name', updatedShortAnswerName,
      '--question-text', '<p>Write the updated keyword generated by the MoodlIA CLI.</p>',
      '--options', JSON.stringify({
        answers: [
          {
            text: 'Updated MoodlIA',
            fraction: 1,
            feedback: 'Correct after update.'
          }
        ],
        case_sensitive: false
      })
    ]);

    assert.equal(updatedShortAnswer.question_type, 'shortanswer');
    assert.equal(updatedShortAnswer.name, updatedShortAnswerName);
    assert.equal(typeof updatedShortAnswer.question_id, 'number');

    const createdMultichoice = await callCli([
      'create-question',
      '--category-id', String(createdCategory.category_id),
      '--context-id', String(createdCategory.context_id),
      '--question-type', 'multichoice',
      '--name', multichoiceName,
      '--question-text', '<p>Choose the generated MoodlIA CLI option.</p>',
      '--options', JSON.stringify({
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
      })
    ]);

    assert.equal(createdMultichoice.category_id, createdCategory.category_id);
    assert.equal(createdMultichoice.question_type, 'multichoice');
    assert.equal(createdMultichoice.name, multichoiceName);
    assert.equal(typeof createdMultichoice.question_id, 'number');

    const updatedMultichoice = await callCli([
      'update-question',
      '--question-id', String(createdMultichoice.question_id),
      '--name', updatedMultichoiceName,
      '--question-text', '<p>Choose the updated generated MoodlIA CLI option.</p>',
      '--options', JSON.stringify({
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
      })
    ]);

    assert.equal(updatedMultichoice.question_type, 'multichoice');
    assert.equal(updatedMultichoice.name, updatedMultichoiceName);
    assert.equal(typeof updatedMultichoice.question_id, 'number');

    const createdNumerical = await callCli([
      'create-question',
      '--category-id', String(createdCategory.category_id),
      '--context-id', String(createdCategory.context_id),
      '--question-type', 'numerical',
      '--name', numericalName,
      '--question-text', '<p>Enter the generated numeric value from the MoodlIA CLI.</p>',
      '--options', JSON.stringify({
        answers: [
          {
            text: '42',
            tolerance: '0.01',
            fraction: 1,
            feedback: 'Correct.'
          }
        ]
      })
    ]);

    assert.equal(createdNumerical.category_id, createdCategory.category_id);
    assert.equal(createdNumerical.question_type, 'numerical');
    assert.equal(createdNumerical.name, numericalName);
    assert.equal(typeof createdNumerical.question_id, 'number');

    const updatedNumerical = await callCli([
      'update-question',
      '--question-id', String(createdNumerical.question_id),
      '--name', updatedNumericalName,
      '--question-text', '<p>Enter the updated generated numeric value from the MoodlIA CLI.</p>',
      '--options', JSON.stringify({
        answers: [
          {
            text: '43',
            tolerance: '0.01',
            fraction: 1,
            feedback: 'Correct after update.'
          }
        ]
      })
    ]);

    assert.equal(updatedNumerical.question_type, 'numerical');
    assert.equal(updatedNumerical.name, updatedNumericalName);
    assert.equal(typeof updatedNumerical.question_id, 'number');

    const createdMatching = await callCli([
      'create-question',
      '--category-id', String(createdCategory.category_id),
      '--context-id', String(createdCategory.context_id),
      '--question-type', 'matching',
      '--name', matchingName,
      '--question-text', '<p>Match each generated Moodle concept from the CLI.</p>',
      '--options', JSON.stringify({
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
        correct_feedback: 'All CLI pairs are correct.',
        incorrect_feedback: 'Review the generated interfaces.'
      })
    ]);

    assert.equal(createdMatching.category_id, createdCategory.category_id);
    assert.equal(createdMatching.question_type, 'matching');
    assert.equal(createdMatching.name, matchingName);
    assert.equal(typeof createdMatching.question_id, 'number');

    const updatedMatching = await callCli([
      'update-question',
      '--question-id', String(createdMatching.question_id),
      '--name', updatedMatchingName,
      '--question-text', '<p>Match each updated Moodle concept from the CLI.</p>',
      '--options', JSON.stringify({
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
        correct_feedback: 'Updated CLI pairs are correct.',
        incorrect_feedback: 'Review the updated banks.'
      })
    ]);

    assert.equal(updatedMatching.question_type, 'matching');
    assert.equal(updatedMatching.name, updatedMatchingName);
    assert.equal(typeof updatedMatching.question_id, 'number');

    const createdEssay = await callCli([
      'create-question',
      '--category-id', String(createdCategory.category_id),
      '--context-id', String(createdCategory.context_id),
      '--question-type', 'essay',
      '--name', essayName,
      '--question-text', '<p>Explain how MoodlIA creates Moodle content from the CLI.</p>',
      '--options', JSON.stringify({
        response_format: 'plain',
        response_required: true,
        response_field_lines: 10,
        response_template: 'Write a concise explanation.',
        grader_info: '<p>Look for REST, MCP, and CLI parity.</p>'
      })
    ]);

    assert.equal(createdEssay.category_id, createdCategory.category_id);
    assert.equal(createdEssay.question_type, 'essay');
    assert.equal(createdEssay.name, essayName);
    assert.equal(typeof createdEssay.question_id, 'number');

    const updatedEssay = await callCli([
      'update-question',
      '--question-id', String(createdEssay.question_id),
      '--name', updatedEssayName,
      '--question-text', '<p>Explain how MoodlIA keeps Moodle content generation verifiable.</p>',
      '--options', JSON.stringify({
        response_format: 'plain',
        response_required: true,
        response_field_lines: 12,
        response_template: 'Mention browser verification.',
        grader_info: '<p>Look for browser-visible verification details.</p>'
      })
    ]);

    assert.equal(updatedEssay.question_type, 'essay');
    assert.equal(updatedEssay.name, updatedEssayName);
    assert.equal(typeof updatedEssay.question_id, 'number');

    const listedQuestions = await callCli([
      'get-questions',
      '--course-id', String(courseId),
      '--category-id', String(createdCategory.category_id),
      '--context-id', String(createdCategory.context_id),
      '--question-bank-module-id', String(createdCategory.question_bank_module_id)
    ]);
    assert.ok(
      listedQuestions.questions.some((question) =>
        question.question_id === updatedQuestion.question_id &&
        question.name === updatedQuestionName &&
        question.question_type === 'truefalse' &&
        question.question_text.includes('Was this question updated by the MoodlIA CLI?')
      ),
      'CLI get-questions must list updated truefalse questions in the category'
    );
    assert.ok(
      listedQuestions.questions.some((question) =>
        question.question_id === updatedMatching.question_id &&
        question.name === updatedMatchingName &&
        question.question_type === 'matching'
      ),
      'CLI get-questions must expose matching questions with canonical question_type'
    );

    const moveTargetCategory = await callCli([
      'create-question-category',
      '--course-id', String(courseId),
      '--name', moveTargetCategoryName,
      '--question-bank-module-id', String(createdCategory.question_bank_module_id),
      '--description', 'Target category for MoodlIA CLI move-question tests.'
    ]);

    assert.equal(moveTargetCategory.name, moveTargetCategoryName);
    assert.equal(moveTargetCategory.question_bank_module_id, createdCategory.question_bank_module_id);

    const movableQuestion = await callCli([
      'create-question',
      '--category-id', String(createdCategory.category_id),
      '--context-id', String(createdCategory.context_id),
      '--question-type', 'truefalse',
      '--name', movableQuestionName,
      '--question-text', '<p>This question will be moved by MoodlIA CLI tests.</p>',
      '--options', JSON.stringify({
        correct_answer: true
      })
    ]);

    const movedQuestion = await callCli([
      'move-question',
      '--course-id', String(courseId),
      '--question-id', String(movableQuestion.question_id),
      '--target-category-id', String(moveTargetCategory.category_id),
      '--target-question-bank-module-id', String(createdCategory.question_bank_module_id)
    ]);
    assert.equal(movedQuestion.moved, true);
    assert.equal(movedQuestion.question_id, movableQuestion.question_id);
    assert.equal(movedQuestion.source_category_id, createdCategory.category_id);
    assert.equal(movedQuestion.target_category_id, moveTargetCategory.category_id);
    assert.equal(movedQuestion.target_bank_scope, 'course_shared');

    const sourceQuestionsAfterMove = await callCli([
      'get-questions',
      '--course-id', String(courseId),
      '--category-id', String(createdCategory.category_id),
      '--context-id', String(createdCategory.context_id),
      '--question-bank-module-id', String(createdCategory.question_bank_module_id)
    ]);
    assert.equal(
      sourceQuestionsAfterMove.questions.some((question) => question.question_id === movableQuestion.question_id),
      false,
      'CLI move-question must remove the question from the source category listing'
    );

    const targetQuestionsAfterMove = await callCli([
      'get-questions',
      '--course-id', String(courseId),
      '--category-id', String(moveTargetCategory.category_id),
      '--question-bank-module-id', String(createdCategory.question_bank_module_id)
    ]);
    assert.ok(
      targetQuestionsAfterMove.questions.some((question) =>
        question.question_id === movableQuestion.question_id &&
        question.name === movableQuestionName
      ),
      'CLI move-question must add the question to the target category listing'
    );

    const deletableQuestion = await callCli([
      'create-question',
      '--category-id', String(createdCategory.category_id),
      '--context-id', String(createdCategory.context_id),
      '--question-type', 'truefalse',
      '--name', deletedQuestionName,
      '--question-text', '<p>This question will be deleted by MoodlIA CLI tests.</p>',
      '--options', JSON.stringify({
        correct_answer: true
      })
    ]);

    const listedQuestionsBeforeDelete = await callCli([
      'get-questions',
      '--course-id', String(courseId),
      '--category-id', String(createdCategory.category_id),
      '--context-id', String(createdCategory.context_id),
      '--question-bank-module-id', String(createdCategory.question_bank_module_id)
    ]);
    assert.ok(
      listedQuestionsBeforeDelete.questions.some((question) => question.question_id === deletableQuestion.question_id),
      'CLI get-questions must list a newly created deletable question'
    );

    const deletedQuestion = await callCli([
      'delete-question',
      '--question-id', String(deletableQuestion.question_id)
    ]);
    assert.equal(deletedQuestion.deleted, true);
    assert.equal(deletedQuestion.id, deletableQuestion.question_id);

    const listedQuestionsAfterDelete = await callCli([
      'get-questions',
      '--course-id', String(courseId),
      '--category-id', String(createdCategory.category_id),
      '--context-id', String(createdCategory.context_id),
      '--question-bank-module-id', String(createdCategory.question_bank_module_id)
    ]);
    assert.equal(
      listedQuestionsAfterDelete.questions.some((question) => question.question_id === deletableQuestion.question_id),
      false,
      'CLI get-questions must not list a deleted question'
    );

    const createdQuiz = await callCli([
      'create-module',
      '--course-id', String(courseId),
      '--section-number', String(createdSection.section_number),
      '--module-type', 'quiz',
      '--name', quizName,
      '--options', JSON.stringify({
        intro: '<p>CLI quiz activity created by MoodlIA automated tests.</p>',
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
      })
    ]);

    assert.equal(createdQuiz.module_type, 'quiz');
    assert.equal(createdQuiz.name, quizName);
    assert.equal(typeof createdQuiz.course_module_id, 'number');

    const privateCategory = await callCli([
      'create-question-category',
      '--course-id', String(courseId),
      '--name', privateCategoryName,
      '--bank-scope', 'quiz_private',
      '--quiz-module-id', String(createdQuiz.course_module_id),
      '--description', 'Created in the quiz-private bank by MoodlIA CLI tests.'
    ]);

    assert.equal(privateCategory.name, privateCategoryName);
    assert.equal(privateCategory.bank_scope, 'quiz_private');
    assert.equal(privateCategory.question_bank_module_id, null);
    assert.equal(privateCategory.quiz_module_id, createdQuiz.course_module_id);

    const privateQuestion = await callCli([
      'create-question',
      '--category-id', String(privateCategory.category_id),
      '--context-id', String(privateCategory.context_id),
      '--question-type', 'truefalse',
      '--name', privateQuestionName,
      '--question-text', '<p>Is this question stored in the quiz-private bank by the CLI?</p>',
      '--options', JSON.stringify({
        correct_answer: true,
        feedback_true: 'Correct.',
        feedback_false: 'Incorrect.'
      })
    ]);

    assert.equal(privateQuestion.category_id, privateCategory.category_id);
    assert.equal(privateQuestion.question_type, 'truefalse');

    const quizQuestion = await callCli([
      'add-question-to-quiz',
      '--quiz-module-id', String(createdQuiz.course_module_id),
      '--question-id', String(privateQuestion.question_id)
    ]);

    assert.equal(quizQuestion.question_id, privateQuestion.question_id);
    assert.equal(typeof quizQuestion.quiz_id, 'number');
    assert.equal(typeof quizQuestion.slot, 'number');
    assert.equal(typeof quizQuestion.maxmark, 'number');
    assert.ok(quizQuestion.maxmark > 0, 'Quiz questions must have a positive slot maxmark.');

    const listedQuizQuestions = await callCli([
      'get-quiz-questions',
      '--quiz-module-id', String(createdQuiz.course_module_id)
    ]);
    assert.ok(
      listedQuizQuestions.questions.some((question) =>
        question.question_id === privateQuestion.question_id &&
        question.slot === quizQuestion.slot &&
        question.maxmark > 0
      ),
      'CLI added quiz question must be present in quiz question listing'
    );

    const updatedQuizQuestionSlot = await callCli([
      'update-quiz-question-slot',
      '--quiz-module-id', String(createdQuiz.course_module_id),
      '--slot', String(quizQuestion.slot),
      '--max-mark', '2.5'
    ]);
    assert.equal(updatedQuizQuestionSlot.updated, true);
    assert.equal(updatedQuizQuestionSlot.quiz_module_id, createdQuiz.course_module_id);
    assert.equal(updatedQuizQuestionSlot.slot, quizQuestion.slot);
    assert.equal(updatedQuizQuestionSlot.question_id, privateQuestion.question_id);
    assert.equal(updatedQuizQuestionSlot.maxmark, 2.5);

    const listedQuizQuestionsAfterSlotUpdate = await callCli([
      'get-quiz-questions',
      '--quiz-module-id', String(createdQuiz.course_module_id)
    ]);
    assert.ok(
      listedQuizQuestionsAfterSlotUpdate.questions.some((question) =>
        question.question_id === privateQuestion.question_id &&
        question.slot === quizQuestion.slot &&
        question.maxmark === 2.5
      ),
      'CLI update-quiz-question-slot must update the slot maxmark in quiz question listing'
    );

    const removableQuizQuestion = await callCli([
      'create-question',
      '--category-id', String(privateCategory.category_id),
      '--context-id', String(privateCategory.context_id),
      '--question-type', 'truefalse',
      '--name', removableQuizQuestionName,
      '--question-text', '<p>Will this CLI question be removed from the quiz?</p>',
      '--options', JSON.stringify({
        correct_answer: true
      })
    ]);

    const removableQuizSlot = await callCli([
      'add-question-to-quiz',
      '--quiz-module-id', String(createdQuiz.course_module_id),
      '--question-id', String(removableQuizQuestion.question_id)
    ]);
    assert.equal(removableQuizSlot.question_id, removableQuizQuestion.question_id);

    const removedQuizQuestion = await callCli([
      'remove-question-from-quiz',
      '--quiz-module-id', String(createdQuiz.course_module_id),
      '--slot', String(removableQuizSlot.slot)
    ]);
    assert.equal(removedQuizQuestion.removed, true);
    assert.equal(removedQuizQuestion.question_id, removableQuizQuestion.question_id);
    assert.equal(removedQuizQuestion.slot, removableQuizSlot.slot);

    const listedQuizQuestionsAfterRemove = await callCli([
      'get-quiz-questions',
      '--quiz-module-id', String(createdQuiz.course_module_id)
    ]);
    assert.equal(
      listedQuizQuestionsAfterRemove.questions.some((question) =>
        question.question_id === removableQuizQuestion.question_id
      ),
      false,
      'CLI removed quiz question must not be present in quiz question listing'
    );
    assert.ok(
      listedQuizQuestionsAfterRemove.questions.some((question) => question.question_id === privateQuestion.question_id),
      'CLI remove-question-from-quiz must leave other quiz questions in place'
    );

    const randomQuizQuestions = await callCli([
      'add-random-questions-to-quiz',
      '--quiz-module-id', String(createdQuiz.course_module_id),
      '--category-id', String(createdCategory.category_id),
      '--context-id', String(createdCategory.context_id),
      '--number', '1',
      '--question-bank-module-id', String(createdCategory.question_bank_module_id)
    ]);
    assert.equal(randomQuizQuestions.quiz_module_id, createdQuiz.course_module_id);
    assert.equal(randomQuizQuestions.category_id, createdCategory.category_id);
    assert.equal(randomQuizQuestions.added_count, 1);
    assert.equal(randomQuizQuestions.slots.length, 1);
    assert.equal(randomQuizQuestions.slots[0].question_type, 'random');
    assert.ok(randomQuizQuestions.slots[0].maxmark > 0, 'CLI random quiz slot must have a positive maxmark');

    const listedQuizQuestionsAfterRandom = await callCli([
      'get-quiz-questions',
      '--quiz-module-id', String(createdQuiz.course_module_id)
    ]);
    assert.ok(
      listedQuizQuestionsAfterRandom.questions.some((question) =>
        question.slot === randomQuizQuestions.slots[0].slot &&
        question.question_type === 'random'
      ),
      'CLI random quiz slot must be present in quiz question listing'
    );
    assert.ok(
      listedQuizQuestionsAfterRandom.questions.some((question) => question.question_id === privateQuestion.question_id),
      'CLI add-random-questions-to-quiz must leave explicitly added questions in place'
    );

    const quizDetails = await callCli([
      'get-module-details',
      '--course-id', String(courseId),
      '--module-id', String(createdQuiz.course_module_id)
    ]);
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
    assert.ok(quizExtra.activity.sumgrades > 0, 'CLI quiz details must expose positive sumgrades after adding a question');

    const startedQuizAttempt = await callCli([
      'start-quiz-attempt',
      '--quiz-module-id', String(createdQuiz.course_module_id)
    ]);
    assert.equal(startedQuizAttempt.quiz_id, quizQuestion.quiz_id);
    assert.equal(startedQuizAttempt.quiz_module_id, createdQuiz.course_module_id);
    assert.ok(startedQuizAttempt.attempt.attempt_id > 0, 'CLI quiz attempt id must be positive.');
    assert.equal(startedQuizAttempt.attempt.quiz_id, quizQuestion.quiz_id);
    assert.equal(startedQuizAttempt.attempt.user_id, currentUser.id);
    assert.equal(startedQuizAttempt.attempt.state, 'inprogress');

    const listedQuizAttempts = await callCli([
      'get-quiz-attempts',
      '--quiz-module-id', String(createdQuiz.course_module_id),
      '--user-id', String(currentUser.id),
      '--status', 'all',
      '--include-previews', 'true'
    ]);
    assert.ok(
      listedQuizAttempts.attempts.some((attempt) =>
        attempt.attempt_id === startedQuizAttempt.attempt.attempt_id &&
        attempt.state === 'inprogress'
      ),
      'started CLI quiz attempt must be present in quiz attempt listing'
    );

    const deletedQuiz = await callCli([
      'delete-module',
      '--course-id', String(courseId),
      '--module-id', String(createdQuiz.course_module_id)
    ]);

    assert.equal(deletedQuiz.deleted, true);
    assert.equal(deletedQuiz.id, createdQuiz.course_module_id);
    quizDeleted = true;

    const deletedSection = await callCli([
      'delete-section',
      '--course-id', String(courseId),
      '--section-id', String(createdSection.section_id),
      '--delete-mode', 'delete'
    ]);

    assert.equal(deletedSection.deleted, true);
    assert.equal(deletedSection.id, createdSection.section_id);
    sectionDeleted = true;

    const deletedCourse = await callCli([
      'delete-course',
      '--course-id', String(courseId)
    ]);

    assert.equal(deletedCourse.deleted, true);
    assert.equal(deletedCourse.id, courseId);
    courseId = null;
  } catch (error) {
    if (courseId) {
      console.error(`Generated CLI content course left in Moodle for inspection: ${courseId}`);
      if (!fileDeleted) {
        console.error('CLI file cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!folderDeleted) {
        console.error('CLI folder cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!emptyCategoryDeleted) {
        console.error('CLI empty question category cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!quizDeleted) {
        console.error('CLI quiz cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!sectionDeleted) {
        console.error('CLI section cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
    }
    throw error;
  }
});
