import assert from 'node:assert/strict';
import test from 'node:test';
import { loadContract, toRestFunctionName } from '../helpers/contract.mjs';
import { requireEnv } from '../helpers/env.mjs';
import { callRestFunction } from '../helpers/moodle-rest.mjs';

const hasRestConfig = requireEnv(['MOODLE_BASE_URL', 'MOODLE_REST_TOKEN']);

test('REST generated course and section lifecycle works', { skip: !hasRestConfig }, async () => {
  const contract = await loadContract();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const courseCategoryName = `MoodlIA Test Course Category ${suffix}`;
  const updatedCourseCategoryName = `MoodlIA Updated Course Category ${suffix}`;
  const createdCourseName = `MoodlIA Test Course ${suffix}`;
  const createdCourseShortname = `moodlia-test-${suffix}`;
  const updatedCourseName = `MoodlIA Updated Course ${suffix}`;
  const createdCourseSummary = `<p>MoodlIA REST course summary ${suffix}</p>`;
  const updatedCourseSummary = `<p>MoodlIA REST updated course summary ${suffix}</p>`;
  const eventName = `MoodlIA REST Calendar Event ${suffix}`;
  const updatedEventName = `MoodlIA REST Updated Calendar Event ${suffix}`;
  const eventDescription = `MoodlIA REST calendar description ${suffix}`;
  const updatedEventDescription = `MoodlIA REST updated calendar description ${suffix}`;
  const eventStart = Math.floor(Date.now() / 1000) + 86400;
  const updatedEventStart = eventStart + 3600;
  const courseStart = eventStart - 86400;
  const courseEnd = eventStart + 604800;
  const updatedCourseEnd = eventStart + 1209600;
  const groupName = `MoodlIA Test Group ${suffix}`;
  const updatedGroupName = `MoodlIA Updated Group ${suffix}`;
  const groupDescription = `MoodlIA REST group description ${suffix}`;
  const groupingName = `MoodlIA Test Grouping ${suffix}`;
  const updatedGroupingName = `MoodlIA Updated Grouping ${suffix}`;
  const groupingDescription = `MoodlIA REST grouping description ${suffix}`;
  const updatedGroupingDescription = `MoodlIA REST updated grouping description ${suffix}`;
  const sectionName = `MoodlIA Test Section ${suffix}`;
  const updatedSectionName = `MoodlIA Updated Section ${suffix}`;
  const moduleName = `MoodlIA Test Page ${suffix}`;
  const updatedModuleName = `MoodlIA Updated Page ${suffix}`;
  const duplicatedModuleName = `MoodlIA Duplicated Page ${suffix}`;
  const assignName = `MoodlIA Test Assignment ${suffix}`;
  const updatedAssignName = `MoodlIA Updated Assignment ${suffix}`;
  const assignIntro = `MoodlIA REST assignment intro ${suffix}`;
  const assignmentSubmissionText = `MoodlIA REST assignment submission ${suffix}`;
  const assignmentGrade = 88.5;
  const assignmentFeedbackComment = `MoodlIA REST assignment feedback ${suffix}`;
  const bookName = `MoodlIA Test Book ${suffix}`;
  const labelName = `MoodlIA Test Label ${suffix}`;
  const labelText = `MoodlIA REST label content ${suffix}`;
  const urlName = `MoodlIA Test URL ${suffix}`;
  const updatedUrlName = `MoodlIA Updated URL ${suffix}`;
  const externalUrl = `https://example.com/moodlia-rest-${suffix}`;
  const forumName = `MoodlIA Test Forum ${suffix}`;
  const updatedForumName = `MoodlIA Updated Forum ${suffix}`;
  const forumIntro = `MoodlIA REST forum intro ${suffix}`;
  const forumDiscussionName = `MoodlIA REST Discussion ${suffix}`;
  const forumDiscussionMessage = `<p>MoodlIA REST discussion message ${suffix}</p>`;
  const forumReplySubject = `MoodlIA REST Reply ${suffix}`;
  const forumReplyMessage = `<p>MoodlIA REST reply message ${suffix}</p>`;
  const updatedForumReplySubject = `MoodlIA REST Updated Reply ${suffix}`;
  const updatedForumReplyMessage = `<p>MoodlIA REST updated reply message ${suffix}</p>`;
  const glossaryName = `MoodlIA Test Glossary ${suffix}`;
  const glossaryConcept = `MoodlIA REST Concept ${suffix}`;
  const updatedGlossaryConcept = `MoodlIA REST Updated Concept ${suffix}`;
  const glossaryDefinition = `<p>MoodlIA REST glossary definition ${suffix}</p>`;
  const updatedGlossaryDefinition = `<p>MoodlIA REST updated glossary definition ${suffix}</p>`;
  const wikiName = `MoodlIA Test Wiki ${suffix}`;
  const wikiFirstPage = `MoodlIA REST Wiki Home ${suffix}`;
  const wikiPageTitle = `MoodlIA REST Wiki Page ${suffix}`;
  const wikiPageContent = `<h3>MoodlIA REST wiki page ${suffix}</h3><p>Initial generated wiki content.</p>`;
  const updatedWikiPageContent = `<h3>MoodlIA REST updated wiki page ${suffix}</h3><p>Updated generated wiki content.</p>`;
  const folderName = `MoodlIA Test Folder ${suffix}`;
  const filename = `moodlia-${suffix}.txt`;
  const categoryName = `MoodlIA Test Questions ${suffix}`;
  const updatedCategoryName = `MoodlIA Updated Questions ${suffix}`;
  const emptyCategoryName = `MoodlIA Empty Questions ${suffix}`;
  const moveTargetCategoryName = `MoodlIA Move Target Questions ${suffix}`;
  const privateCategoryName = `MoodlIA Private Quiz Questions ${suffix}`;
  const questionName = `MoodlIA True False ${suffix}`;
  const updatedQuestionName = `MoodlIA Updated True False ${suffix}`;
  const movableQuestionName = `MoodlIA Movable Question ${suffix}`;
  const shortAnswerName = `MoodlIA Short Answer ${suffix}`;
  const updatedShortAnswerName = `MoodlIA Updated Short Answer ${suffix}`;
  const multichoiceName = `MoodlIA Multichoice ${suffix}`;
  const updatedMultichoiceName = `MoodlIA Updated Multichoice ${suffix}`;
  const numericalName = `MoodlIA Numerical ${suffix}`;
  const updatedNumericalName = `MoodlIA Updated Numerical ${suffix}`;
  const matchingName = `MoodlIA Matching ${suffix}`;
  const updatedMatchingName = `MoodlIA Updated Matching ${suffix}`;
  const essayName = `MoodlIA Essay ${suffix}`;
  const updatedEssayName = `MoodlIA Updated Essay ${suffix}`;
  const deletedQuestionName = `MoodlIA Deleted Question ${suffix}`;
  const privateQuestionName = `MoodlIA Private True False ${suffix}`;
  const removableQuizQuestionName = `MoodlIA Removable Quiz Question ${suffix}`;
  const quizName = `MoodlIA Test Quiz ${suffix}`;
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
  let folderDeleted = false;
  let fileDeleted = false;
  let quizDeleted = false;
  let emptyCategoryDeleted = false;
  let courseCategoryDeleted = false;
  let calendarEventDeleted = false;

  try {
    const createdCourseCategory = await callRestFunction(toRestFunctionName(contract, 'create_course_category'), {
      name: courseCategoryName,
      visible: 1
    });

    assert.equal(createdCourseCategory.name, courseCategoryName);
    assert.equal(createdCourseCategory.parent_id, 0);
    assert.equal(createdCourseCategory.visible, true);
    assert.equal(typeof createdCourseCategory.category_id, 'number');
    courseCategoryId = createdCourseCategory.category_id;

    const updatedCourseCategory = await callRestFunction(toRestFunctionName(contract, 'update_course_category'), {
      category_id: courseCategoryId,
      name: updatedCourseCategoryName,
      visible: 1
    });

    assert.equal(updatedCourseCategory.category_id, courseCategoryId);
    assert.equal(updatedCourseCategory.name, updatedCourseCategoryName);

    const listedCourseCategories = await callRestFunction(toRestFunctionName(contract, 'get_course_categories'), {
      parent_id: -1
    });
    assert.ok(
      listedCourseCategories.categories.some((category) =>
        category.category_id === courseCategoryId &&
        category.name === updatedCourseCategoryName
      ),
      'created course category must be present in get_course_categories'
    );

    const createdCourse = await callRestFunction(toRestFunctionName(contract, 'create_course'), {
      fullname: createdCourseName,
      shortname: createdCourseShortname,
      category_id: courseCategoryId,
      visible: 0,
      summary: createdCourseSummary,
      summary_format: 'html',
      course_format: 'topics',
      start_date: courseStart,
      end_date: courseEnd
    });

    assert.equal(createdCourse.fullname, createdCourseName);
    assert.equal(createdCourse.shortname, createdCourseShortname);
    assert.equal(createdCourse.category_id, courseCategoryId);
    assert.equal(createdCourse.summary_format, 'html');
    assert.equal(createdCourse.format, 'topics');
    assert.equal(createdCourse.start_date, courseStart);
    assert.equal(createdCourse.end_date, courseEnd);
    assert.match(createdCourse.summary, /MoodlIA REST course summary/);
    assert.equal(typeof createdCourse.course_id, 'number');
    courseId = createdCourse.course_id;

    const updatedCourse = await callRestFunction(toRestFunctionName(contract, 'update_course'), {
      course_id: courseId,
      fullname: updatedCourseName,
      visible: 0,
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
    assert.match(updatedCourse.summary, /MoodlIA REST updated course summary/);

    const courseDetails = await callRestFunction(toRestFunctionName(contract, 'get_course_details'), {
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
    assert.match(courseDetails.summary, /MoodlIA REST updated course summary/);

    const createdCalendarEvent = await callRestFunction(toRestFunctionName(contract, 'create_calendar_event'), {
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

    const listedCalendarEvents = await callRestFunction(toRestFunctionName(contract, 'get_calendar_events'), {
      course_id: courseId,
      time_from: eventStart - 3600,
      time_to: eventStart + 7200
    });
    assert.ok(
      listedCalendarEvents.events.some((event) =>
        event.event_id === calendarEventId &&
        event.name === eventName
      ),
      'created calendar event must be present in get_calendar_events'
    );

    const updatedCalendarEvent = await callRestFunction(toRestFunctionName(contract, 'update_calendar_event'), {
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

    const currentUser = await callRestFunction(toRestFunctionName(contract, 'get_current_user'));
    assert.equal(typeof currentUser.id, 'number');

    const enrolledUser = await callRestFunction(toRestFunctionName(contract, 'enrol_user'), {
      course_id: courseId,
      user_id: currentUser.id,
      role_archetype: 'student'
    });

    assert.equal(enrolledUser.course_id, courseId);
    assert.equal(enrolledUser.user_id, currentUser.id);
    assert.equal(enrolledUser.role_archetype, 'student');
    assert.equal(enrolledUser.enrolled, true);
    assert.ok(enrolledUser.user.roles.includes('student'), 'enrolled user must have the student role');

    const enrolledUsers = await callRestFunction(toRestFunctionName(contract, 'get_enrolled_users'), {
      course_id: courseId
    });
    assert.ok(
      enrolledUsers.users.some((user) =>
        user.user_id === currentUser.id &&
        user.username === currentUser.username &&
        user.roles.includes('student')
      ),
      'current user must be listed as an enrolled student'
    );

    const createdGroup = await callRestFunction(toRestFunctionName(contract, 'create_group'), {
      course_id: courseId,
      name: groupName,
      description: groupDescription
    });

    assert.equal(createdGroup.course_id, courseId);
    assert.equal(createdGroup.name, groupName);
    assert.equal(typeof createdGroup.group_id, 'number');

    const listedGroups = await callRestFunction(toRestFunctionName(contract, 'get_groups'), {
      course_id: courseId
    });
    assert.ok(
      listedGroups.groups.some((group) => group.group_id === createdGroup.group_id && group.name === groupName),
      'created group must be present in get_groups'
    );

    const createdGrouping = await callRestFunction(toRestFunctionName(contract, 'create_grouping'), {
      course_id: courseId,
      name: groupingName,
      description: groupingDescription
    });

    assert.equal(createdGrouping.course_id, courseId);
    assert.equal(createdGrouping.name, groupingName);
    assert.equal(typeof createdGrouping.grouping_id, 'number');

    const listedGroupings = await callRestFunction(toRestFunctionName(contract, 'get_groupings'), {
      course_id: courseId
    });
    assert.ok(
      listedGroupings.groupings.some((grouping) =>
        grouping.grouping_id === createdGrouping.grouping_id &&
        grouping.name === groupingName
      ),
      'created grouping must be present in get_groupings'
    );

    const addedGroupToGrouping = await callRestFunction(toRestFunctionName(contract, 'add_group_to_grouping'), {
      course_id: courseId,
      grouping_id: createdGrouping.grouping_id,
      group_id: createdGroup.group_id
    });

    assert.equal(addedGroupToGrouping.course_id, courseId);
    assert.equal(addedGroupToGrouping.grouping_id, createdGrouping.grouping_id);
    assert.equal(addedGroupToGrouping.group_id, createdGroup.group_id);
    assert.equal(addedGroupToGrouping.added, true);
    assert.equal(addedGroupToGrouping.grouping.name, groupingName);
    assert.equal(addedGroupToGrouping.group.name, groupName);

    const updatedGrouping = await callRestFunction(toRestFunctionName(contract, 'update_grouping'), {
      course_id: courseId,
      grouping_id: createdGrouping.grouping_id,
      name: updatedGroupingName,
      description: updatedGroupingDescription
    });

    assert.equal(updatedGrouping.grouping_id, createdGrouping.grouping_id);
    assert.equal(updatedGrouping.name, updatedGroupingName);
    assert.equal(updatedGrouping.description, updatedGroupingDescription);

    const removedGroupFromGrouping = await callRestFunction(toRestFunctionName(contract, 'remove_group_from_grouping'), {
      course_id: courseId,
      grouping_id: createdGrouping.grouping_id,
      group_id: createdGroup.group_id
    });

    assert.equal(removedGroupFromGrouping.removed, true);
    groupRemovedFromGrouping = true;

    const deletedGrouping = await callRestFunction(toRestFunctionName(contract, 'delete_grouping'), {
      course_id: courseId,
      grouping_id: createdGrouping.grouping_id
    });

    assert.equal(deletedGrouping.deleted, true);
    assert.equal(deletedGrouping.id, createdGrouping.grouping_id);
    groupingDeleted = true;

    const addedGroupMember = await callRestFunction(toRestFunctionName(contract, 'add_group_member'), {
      course_id: courseId,
      group_id: createdGroup.group_id,
      user_id: currentUser.id
    });

    assert.equal(addedGroupMember.course_id, courseId);
    assert.equal(addedGroupMember.group_id, createdGroup.group_id);
    assert.equal(addedGroupMember.user_id, currentUser.id);
    assert.equal(addedGroupMember.added, true);

    const listedGroupMembers = await callRestFunction(toRestFunctionName(contract, 'get_group_members'), {
      course_id: courseId,
      group_id: createdGroup.group_id
    });
    assert.ok(
      listedGroupMembers.members.some((member) =>
        member.user_id === currentUser.id &&
        member.username === currentUser.username
      ),
      'created group must list the added current user'
    );

    const removedGroupMember = await callRestFunction(toRestFunctionName(contract, 'remove_group_member'), {
      course_id: courseId,
      group_id: createdGroup.group_id,
      user_id: currentUser.id
    });

    assert.equal(removedGroupMember.removed, true);
    groupMemberRemoved = true;

    const updatedGroup = await callRestFunction(toRestFunctionName(contract, 'update_group'), {
      course_id: courseId,
      group_id: createdGroup.group_id,
      name: updatedGroupName
    });

    assert.equal(updatedGroup.group_id, createdGroup.group_id);
    assert.equal(updatedGroup.name, updatedGroupName);

    const deletedGroup = await callRestFunction(toRestFunctionName(contract, 'delete_group'), {
      course_id: courseId,
      group_id: createdGroup.group_id
    });

    assert.equal(deletedGroup.deleted, true);
    assert.equal(deletedGroup.id, createdGroup.group_id);
    groupDeleted = true;

    const unenrolledUser = await callRestFunction(toRestFunctionName(contract, 'unenrol_user'), {
      course_id: courseId,
      user_id: currentUser.id
    });

    assert.equal(unenrolledUser.course_id, courseId);
    assert.equal(unenrolledUser.user_id, currentUser.id);
    assert.equal(unenrolledUser.unenrolled, true);
    userUnenrolled = true;

    const createdSection = await callRestFunction(toRestFunctionName(contract, 'create_section'), {
      course_id: courseId,
      name: sectionName,
      summary: 'Created by MoodlIA automated tests.'
    });

    assert.equal(createdSection.course_id, courseId);
    assert.equal(createdSection.name, sectionName);
    assert.equal(typeof createdSection.section_id, 'number');
    assert.equal(createdSection.visible, true);
    assert.match(createdSection.summary, /Created by MoodlIA automated tests\./);

    const updatedSection = await callRestFunction(toRestFunctionName(contract, 'update_section'), {
      course_id: courseId,
      section_id: createdSection.section_id,
      name: updatedSectionName,
      summary: 'Updated by MoodlIA automated tests.',
      visible: 0
    });

    assert.equal(updatedSection.section_id, createdSection.section_id);
    assert.equal(updatedSection.name, updatedSectionName);
    assert.equal(updatedSection.visible, false);
    assert.match(updatedSection.summary, /Updated by MoodlIA automated tests\./);

    const reshownSection = await callRestFunction(toRestFunctionName(contract, 'update_section'), {
      course_id: courseId,
      section_id: createdSection.section_id,
      visible: 1
    });

    assert.equal(reshownSection.section_id, createdSection.section_id);
    assert.equal(reshownSection.visible, true);

    const createdModule = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: createdSection.section_number,
      module_type: 'page',
      name: moduleName,
      options: JSON.stringify({
        content: '<p>Created by MoodlIA automated tests.</p>',
        visible: false,
        show_description: true,
        id_number: `moodlia-${suffix.toLowerCase()}`,
        language: 'en',
        group_mode: 'none',
        availability: { op: '&', c: [], showc: [] },
        tags: [`moodlia-${suffix.toLowerCase()}`],
        download_content: false,
        print_intro: true,
        print_last_modified: false
      })
    });

    assert.equal(createdModule.module_type, 'page');
    assert.equal(createdModule.name, moduleName);
    assert.equal(createdModule.visible, false);
    assert.equal(typeof createdModule.visible_on_course_page, 'boolean');
    assert.equal(createdModule.id_number, `moodlia-${suffix.toLowerCase()}`);
    assert.equal(createdModule.language, 'en');
    assert.equal(createdModule.group_mode, 0);
    assert.equal(createdModule.grouping_id, 0);
    assert.equal(typeof createdModule.availability, 'string');
    assert.equal(createdModule.download_content, false);
    assert.equal(typeof createdModule.course_module_id, 'number');

    const moduleDetails = await callRestFunction(toRestFunctionName(contract, 'get_module_details'), {
      course_id: courseId,
      module_id: createdModule.course_module_id
    });

    assert.equal(moduleDetails.course_module_id, createdModule.course_module_id);
    assert.equal(moduleDetails.instance_id, createdModule.instance_id);
    assert.equal(moduleDetails.module_type, 'page');
    assert.equal(moduleDetails.name, moduleName);
    assert.equal(moduleDetails.section_number, createdSection.section_number);
    assert.equal(moduleDetails.visible, false);
    assert.equal(moduleDetails.visible_on_course_page, createdModule.visible_on_course_page);
    assert.equal(moduleDetails.id_number, `moodlia-${suffix.toLowerCase()}`);
    assert.equal(moduleDetails.download_content, false);
    assert.equal(moduleDetails.show_description, true);
    const pageExtra = JSON.parse(moduleDetails.extra_json);
    assert.equal(pageExtra.activity.page_id, createdModule.instance_id);
    assert.ok(
      pageExtra.activity.content.includes('Created by MoodlIA automated tests.'),
      'page details must expose rendered page content'
    );
    assert.ok(pageExtra.activity.content_length > 0, 'page details must expose content length');

    const updatedModule = await callRestFunction(toRestFunctionName(contract, 'update_module'), {
      course_id: courseId,
      module_id: createdModule.course_module_id,
      name: updatedModuleName,
      visible: 0,
      options: JSON.stringify({
        id_number: `moodlia-updated-${suffix.toLowerCase()}`,
        tags: [`moodlia-updated-${suffix.toLowerCase()}`],
        download_content: true
      })
    });

    assert.equal(updatedModule.course_module_id, createdModule.course_module_id);
    assert.equal(updatedModule.name, updatedModuleName);
    assert.equal(updatedModule.visible, false);
    assert.equal(updatedModule.visible_on_course_page, createdModule.visible_on_course_page);
    assert.equal(updatedModule.id_number, `moodlia-updated-${suffix.toLowerCase()}`);
    assert.equal(updatedModule.download_content, true);

    const hiddenCourseContents = await callRestFunction(toRestFunctionName(contract, 'get_course_contents'), {
      course_id: courseId
    });
    const hiddenModule = hiddenCourseContents.sections
      .flatMap((section) => section.modules)
      .find((module) => module.course_module_id === createdModule.course_module_id);
    assert.equal(hiddenModule.visible, false);
    assert.equal(hiddenModule.visible_on_course_page, updatedModule.visible_on_course_page);

    const reshownModule = await callRestFunction(toRestFunctionName(contract, 'update_module'), {
      course_id: courseId,
      module_id: createdModule.course_module_id,
      visible: 1
    });
    assert.equal(reshownModule.visible, true);
    assert.equal(reshownModule.visible_on_course_page, hiddenModule.visible_on_course_page);

    const coursePageModule = await callRestFunction(toRestFunctionName(contract, 'update_module'), {
      course_id: courseId,
      module_id: createdModule.course_module_id,
      options: JSON.stringify({
        visible_on_course_page: true
      })
    });
    assert.equal(coursePageModule.visible, true);
    assert.equal(coursePageModule.visible_on_course_page, true);

    const duplicatedModule = await callRestFunction(toRestFunctionName(contract, 'duplicate_module'), {
      course_id: courseId,
      module_id: createdModule.course_module_id,
      section_number: createdSection.section_number,
      name: duplicatedModuleName
    });

    assert.notEqual(duplicatedModule.course_module_id, createdModule.course_module_id);
    assert.equal(duplicatedModule.module_type, 'page');
    assert.equal(duplicatedModule.name, duplicatedModuleName);
    assert.match(duplicatedModule.url, /\/mod\/page\/view\.php\?id=/);

    const movedDuplicatedModule = await callRestFunction(toRestFunctionName(contract, 'move_module'), {
      course_id: courseId,
      module_id: duplicatedModule.course_module_id,
      section_number: 0
    });

    assert.equal(movedDuplicatedModule.course_module_id, duplicatedModule.course_module_id);
    assert.equal(movedDuplicatedModule.name, duplicatedModuleName);

    const courseContentsWithMovedDuplicate = await callRestFunction(toRestFunctionName(contract, 'get_course_contents'), {
      course_id: courseId
    });
    const generalSectionWithMovedDuplicate = courseContentsWithMovedDuplicate.sections
      .find((section) => section.section_number === 0);
    const duplicatedContentModule = generalSectionWithMovedDuplicate?.modules
      .find((module) => module.course_module_id === duplicatedModule.course_module_id);
    assert.equal(duplicatedContentModule?.name, duplicatedModuleName);

    const deletedDuplicatedModule = await callRestFunction(toRestFunctionName(contract, 'delete_module'), {
      course_id: courseId,
      module_id: duplicatedModule.course_module_id
    });

    assert.equal(deletedDuplicatedModule.deleted, true);
    assert.equal(deletedDuplicatedModule.id, duplicatedModule.course_module_id);
    duplicatedModuleDeleted = true;

    const deletedModule = await callRestFunction(toRestFunctionName(contract, 'delete_module'), {
      course_id: courseId,
      module_id: createdModule.course_module_id
    });

    assert.equal(deletedModule.deleted, true);
    assert.equal(deletedModule.id, createdModule.course_module_id);
    moduleDeleted = true;

    const createdAssign = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: createdSection.section_number,
      module_type: 'assign',
      name: assignName,
      options: JSON.stringify({
        intro: `<p>${assignIntro}</p>`,
        activity: `<p>REST assignment instructions ${suffix}</p>`,
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
    });

    assert.equal(createdAssign.module_type, 'assign');
    assert.equal(createdAssign.name, assignName);
    assert.equal(typeof createdAssign.course_module_id, 'number');
    assert.match(createdAssign.url, /\/mod\/assign\/view\.php\?id=/);

    const assignDetails = await callRestFunction(toRestFunctionName(contract, 'get_module_details'), {
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

    const updatedAssign = await callRestFunction(toRestFunctionName(contract, 'update_module'), {
      course_id: courseId,
      module_id: createdAssign.course_module_id,
      name: updatedAssignName,
      options: JSON.stringify({
        group_mode: 'visible_groups'
      })
    });

    assert.equal(updatedAssign.course_module_id, createdAssign.course_module_id);
    assert.equal(updatedAssign.name, updatedAssignName);
    assert.equal(updatedAssign.group_mode, 2);

    const assignmentSubmitter = await callRestFunction(toRestFunctionName(contract, 'enrol_user'), {
      course_id: courseId,
      user_id: currentUser.id,
      role_archetype: 'student'
    });
    assert.equal(assignmentSubmitter.enrolled, true);
    userUnenrolled = false;

    const savedAssignmentSubmission = await callRestFunction(toRestFunctionName(contract, 'save_assignment_submission'), {
      course_id: courseId,
      module_id: createdAssign.course_module_id,
      online_text: `<p>${assignmentSubmissionText}</p>`
    });
    assert.equal(savedAssignmentSubmission.course_id, courseId);
    assert.equal(savedAssignmentSubmission.module_id, createdAssign.course_module_id);
    assert.equal(savedAssignmentSubmission.assignment_id, createdAssign.instance_id);
    assert.equal(savedAssignmentSubmission.submitted, false);
    assert.match(savedAssignmentSubmission.online_text, new RegExp(assignmentSubmissionText));

    const listedAssignmentSubmission = await callRestFunction(toRestFunctionName(contract, 'get_assignment_submission_status'), {
      course_id: courseId,
      module_id: createdAssign.course_module_id
    });
    assert.equal(listedAssignmentSubmission.submission_id, savedAssignmentSubmission.submission_id);
    assert.match(listedAssignmentSubmission.online_text, new RegExp(assignmentSubmissionText));

    const submittedAssignment = await callRestFunction(toRestFunctionName(contract, 'submit_assignment_for_grading'), {
      course_id: courseId,
      module_id: createdAssign.course_module_id,
      accept_submission_statement: 1
    });
    assert.equal(submittedAssignment.submitted, true);
    assert.equal(submittedAssignment.status, 'submitted');
    assert.match(submittedAssignment.online_text, new RegExp(assignmentSubmissionText));

    const gradedAssignment = await callRestFunction(toRestFunctionName(contract, 'save_assignment_grade'), {
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

    const gradeItems = await callRestFunction(toRestFunctionName(contract, 'get_grade_items'), {
      course_id: courseId
    });
    assert.ok(
      gradeItems.items.some((item) => item.name === updatedAssignName),
      'REST gradebook items should include the generated assignment.'
    );

    const userGrades = await callRestFunction(toRestFunctionName(contract, 'get_user_grades'), {
      course_id: courseId,
      user_id: currentUser.id
    });
    assert.equal(userGrades.user_id, currentUser.id);
    const assignmentGradeItem = userGrades.items.find((item) => item.course_module_id === createdAssign.course_module_id);
    assert.ok(assignmentGradeItem, 'REST user grades should include the generated assignment grade item.');
    assert.equal(assignmentGradeItem.name, updatedAssignName);
    assert.equal(assignmentGradeItem.grade_raw, assignmentGrade);

    const assignmentUserCleanup = await callRestFunction(toRestFunctionName(contract, 'unenrol_user'), {
      course_id: courseId,
      user_id: currentUser.id
    });
    assert.equal(assignmentUserCleanup.unenrolled, true);
    userUnenrolled = true;

    const deletedAssign = await callRestFunction(toRestFunctionName(contract, 'delete_module'), {
      course_id: courseId,
      module_id: createdAssign.course_module_id
    });

    assert.equal(deletedAssign.deleted, true);
    assert.equal(deletedAssign.id, createdAssign.course_module_id);
    assignDeleted = true;

    const createdBook = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: createdSection.section_number,
      module_type: 'book',
      name: bookName,
      options: JSON.stringify({
        intro: '<p>Created by MoodlIA REST lifecycle tests.</p>',
        numbering: 'numbers',
        custom_titles: false
      })
    });

    assert.equal(createdBook.module_type, 'book');
    assert.equal(createdBook.name, bookName);
    assert.equal(typeof createdBook.course_module_id, 'number');
    assert.match(createdBook.url, /\/mod\/book\/view\.php\?id=/);

    const listedBookChapters = await callRestFunction(toRestFunctionName(contract, 'get_book_chapters'), {
      course_id: courseId,
      module_id: createdBook.course_module_id,
      include_content: 0
    });

    assert.equal(listedBookChapters.module_id, createdBook.course_module_id);
    assert.equal(listedBookChapters.book_id, createdBook.instance_id);
    assert.equal(listedBookChapters.count, listedBookChapters.chapters.length);

    const viewedBook = await callRestFunction(toRestFunctionName(contract, 'view_book'), {
      course_id: courseId,
      module_id: createdBook.course_module_id
    });

    assert.equal(viewedBook.module_id, createdBook.course_module_id);
    assert.equal(viewedBook.book_id, createdBook.instance_id);
    assert.equal(viewedBook.viewed, true);
    assert.equal(Array.isArray(viewedBook.warnings), true);

    const bookDetails = await callRestFunction(toRestFunctionName(contract, 'get_module_details'), {
      course_id: courseId,
      module_id: createdBook.course_module_id
    });
    const bookExtra = JSON.parse(bookDetails.extra_json);
    assert.equal(bookDetails.module_type, 'book');
    assert.equal(bookExtra.activity.book_id, createdBook.instance_id);
    assert.equal(bookExtra.activity.chapter_count, listedBookChapters.count);
    assert.equal(Array.isArray(bookExtra.activity.chapters), true);

    const deletedBook = await callRestFunction(toRestFunctionName(contract, 'delete_module'), {
      course_id: courseId,
      module_id: createdBook.course_module_id
    });

    assert.equal(deletedBook.deleted, true);
    assert.equal(deletedBook.id, createdBook.course_module_id);
    bookDeleted = true;

    const createdLabel = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: createdSection.section_number,
      module_type: 'label',
      name: labelName,
      options: JSON.stringify({
        content: `<p>${labelText}</p>`
      })
    });

    assert.equal(createdLabel.module_type, 'label');
    assert.equal(createdLabel.name, labelName);
    assert.equal(typeof createdLabel.course_module_id, 'number');
    assert.equal(createdLabel.url, '');

    const labelDetails = await callRestFunction(toRestFunctionName(contract, 'get_module_details'), {
      course_id: courseId,
      module_id: createdLabel.course_module_id
    });
    const labelExtra = JSON.parse(labelDetails.extra_json);
    assert.equal(labelDetails.module_type, 'label');
    assert.equal(labelExtra.activity.label_id, createdLabel.instance_id);
    assert.ok(labelExtra.activity.content.includes(labelText), 'label details must expose rendered label content');
    assert.ok(labelExtra.activity.content_length > 0, 'label details must expose content length');

    const courseContentsWithLabel = await callRestFunction(toRestFunctionName(contract, 'get_course_contents'), {
      course_id: courseId
    });
    const sectionWithLabel = courseContentsWithLabel.sections.find((section) => section.section_id === updatedSection.section_id);
    assert.ok(sectionWithLabel, 'updated generated section must be present before label cleanup');
    assert.ok(
      sectionWithLabel.modules.some((module) =>
        module.course_module_id === createdLabel.course_module_id &&
        module.module_type === 'label'
      ),
      'created label module must be present in course contents'
    );

    const deletedLabel = await callRestFunction(toRestFunctionName(contract, 'delete_module'), {
      course_id: courseId,
      module_id: createdLabel.course_module_id
    });

    assert.equal(deletedLabel.deleted, true);
    assert.equal(deletedLabel.id, createdLabel.course_module_id);
    labelDeleted = true;

    const createdUrl = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: createdSection.section_number,
      module_type: 'url',
      name: urlName,
      options: JSON.stringify({
        external_url: externalUrl,
        intro: '<p>Created by MoodlIA REST lifecycle tests.</p>',
        display: 'popup',
        print_intro: false,
        popup_width: 900,
        popup_height: 600
      })
    });

    assert.equal(createdUrl.module_type, 'url');
    assert.equal(createdUrl.name, urlName);
    assert.equal(typeof createdUrl.course_module_id, 'number');
    assert.match(createdUrl.url, /\/mod\/url\/view\.php\?id=/);

    const updatedUrl = await callRestFunction(toRestFunctionName(contract, 'update_module'), {
      course_id: courseId,
      module_id: createdUrl.course_module_id,
      name: updatedUrlName
    });

    assert.equal(updatedUrl.course_module_id, createdUrl.course_module_id);
    assert.equal(updatedUrl.name, updatedUrlName);

    const urlDetails = await callRestFunction(toRestFunctionName(contract, 'get_module_details'), {
      course_id: courseId,
      module_id: createdUrl.course_module_id
    });
    const urlExtra = JSON.parse(urlDetails.extra_json);
    assert.equal(urlDetails.module_type, 'url');
    assert.equal(urlExtra.activity.url_id, createdUrl.instance_id);
    if (urlExtra.activity.external_url !== '') {
      assert.equal(urlExtra.activity.external_url, externalUrl);
    }
    if (urlExtra.activity.popup_width > 0) {
      assert.equal(urlExtra.activity.popup_width, 900);
    }

    const deletedUrl = await callRestFunction(toRestFunctionName(contract, 'delete_module'), {
      course_id: courseId,
      module_id: createdUrl.course_module_id
    });

    assert.equal(deletedUrl.deleted, true);
    assert.equal(deletedUrl.id, createdUrl.course_module_id);
    urlDeleted = true;

    const createdForum = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: createdSection.section_number,
      module_type: 'forum',
      name: forumName,
      options: JSON.stringify({
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
    });

    assert.equal(createdForum.module_type, 'forum');
    assert.equal(createdForum.name, forumName);
    assert.equal(typeof createdForum.course_module_id, 'number');
    assert.match(createdForum.url, /\/mod\/forum\/view\.php\?id=/);

    const createdDiscussion = await callRestFunction(toRestFunctionName(contract, 'create_forum_discussion'), {
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

    const listedDiscussions = await callRestFunction(toRestFunctionName(contract, 'get_forum_discussions'), {
      course_id: courseId,
      module_id: createdForum.course_module_id
    });
    assert.ok(
      listedDiscussions.discussions.some((discussion) =>
        discussion.discussion_id === createdDiscussion.discussion_id &&
        discussion.name === forumDiscussionName
      ),
      'created forum discussion must be present in get_forum_discussions'
    );

    const listedInitialPosts = await callRestFunction(toRestFunctionName(contract, 'get_forum_discussion_posts'), {
      course_id: courseId,
      module_id: createdForum.course_module_id,
      discussion_id: createdDiscussion.discussion_id
    });
    assert.ok(
      listedInitialPosts.posts.some((post) =>
        post.post_id === createdDiscussion.first_post_id &&
        post.subject === forumDiscussionName
      ),
      'created forum discussion must expose its first post'
    );

    const createdReply = await callRestFunction(toRestFunctionName(contract, 'create_forum_discussion_post'), {
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

    const updatedReply = await callRestFunction(toRestFunctionName(contract, 'update_forum_discussion_post'), {
      course_id: courseId,
      module_id: createdForum.course_module_id,
      discussion_id: createdDiscussion.discussion_id,
      post_id: createdReply.post_id,
      subject: updatedForumReplySubject,
      message: updatedForumReplyMessage
    });

    assert.equal(updatedReply.post_id, createdReply.post_id);
    assert.equal(updatedReply.subject, updatedForumReplySubject);

    const listedUpdatedPosts = await callRestFunction(toRestFunctionName(contract, 'get_forum_discussion_posts'), {
      course_id: courseId,
      module_id: createdForum.course_module_id,
      discussion_id: createdDiscussion.discussion_id
    });
    assert.ok(
      listedUpdatedPosts.posts.some((post) =>
        post.post_id === createdReply.post_id &&
        post.subject === updatedForumReplySubject
      ),
      'updated forum reply must be present in get_forum_discussion_posts'
    );

    const forumDetails = await callRestFunction(toRestFunctionName(contract, 'get_module_details'), {
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
      'forum module details must include the created discussion summary'
    );

    const updatedForum = await callRestFunction(toRestFunctionName(contract, 'update_module'), {
      course_id: courseId,
      module_id: createdForum.course_module_id,
      name: updatedForumName
    });

    assert.equal(updatedForum.course_module_id, createdForum.course_module_id);
    assert.equal(updatedForum.name, updatedForumName);

    const deletedForum = await callRestFunction(toRestFunctionName(contract, 'delete_module'), {
      course_id: courseId,
      module_id: createdForum.course_module_id
    });

    assert.equal(deletedForum.deleted, true);
    assert.equal(deletedForum.id, createdForum.course_module_id);
    forumDeleted = true;

    const createdGlossary = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: createdSection.section_number,
      module_type: 'glossary',
      name: glossaryName,
      options: JSON.stringify({
        intro: '<p>REST glossary activity created by MoodlIA automated tests.</p>',
        display_format: 'dictionary',
        allow_duplicated_entries: false,
        allow_comments: true
      })
    });

    assert.equal(createdGlossary.module_type, 'glossary');
    assert.equal(createdGlossary.name, glossaryName);
    assert.equal(typeof createdGlossary.course_module_id, 'number');
    assert.match(createdGlossary.url, /\/mod\/glossary\/view\.php\?id=/);

    const createdGlossaryEntry = await callRestFunction(toRestFunctionName(contract, 'create_glossary_entry'), {
      course_id: courseId,
      module_id: createdGlossary.course_module_id,
      concept: glossaryConcept,
      definition: glossaryDefinition,
      definition_format: 'html',
      options: JSON.stringify({
        aliases: ['moodlia-rest-glossary'],
        usedynalink: true,
        casesensitive: false,
        fullmatch: false
      })
    });

    assert.equal(createdGlossaryEntry.module_id, createdGlossary.course_module_id);
    assert.equal(createdGlossaryEntry.concept, glossaryConcept);
    assert.match(createdGlossaryEntry.definition, new RegExp(suffix));
    assert.equal(createdGlossaryEntry.definition_format, 'html');

    const searchedGlossaryEntries = await callRestFunction(toRestFunctionName(contract, 'search_glossary_entries'), {
      course_id: courseId,
      module_id: createdGlossary.course_module_id,
      query: glossaryConcept,
      full_search: 1,
      order: 'CONCEPT',
      sort: 'ASC',
      from: 0,
      limit: 10,
      include_not_approved: 1
    });
    assert.ok(
      searchedGlossaryEntries.entries.some((entry) => entry.entry_id === createdGlossaryEntry.entry_id),
      'created REST glossary entry must be present in search_glossary_entries'
    );

    const updatedGlossaryEntry = await callRestFunction(toRestFunctionName(contract, 'update_glossary_entry'), {
      course_id: courseId,
      module_id: createdGlossary.course_module_id,
      entry_id: createdGlossaryEntry.entry_id,
      concept: updatedGlossaryConcept,
      definition: updatedGlossaryDefinition,
      definition_format: 'html',
      options: JSON.stringify({
        aliases: ['moodlia-rest-updated-glossary'],
        usedynalink: false
      })
    });

    assert.equal(updatedGlossaryEntry.entry_id, createdGlossaryEntry.entry_id);
    assert.equal(updatedGlossaryEntry.concept, updatedGlossaryConcept);
    assert.match(updatedGlossaryEntry.definition, /updated glossary definition/);

    const searchedUpdatedGlossaryEntries = await callRestFunction(toRestFunctionName(contract, 'search_glossary_entries'), {
      course_id: courseId,
      module_id: createdGlossary.course_module_id,
      query: updatedGlossaryConcept,
      full_search: 1,
      include_not_approved: 1
    });
    assert.ok(
      searchedUpdatedGlossaryEntries.entries.some((entry) =>
        entry.entry_id === createdGlossaryEntry.entry_id &&
        entry.concept === updatedGlossaryConcept
      ),
      'updated REST glossary entry must be searchable'
    );

    const glossaryDetails = await callRestFunction(toRestFunctionName(contract, 'get_module_details'), {
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
      'glossary module details must include the updated entry summary'
    );

    const deletedGlossaryEntry = await callRestFunction(toRestFunctionName(contract, 'delete_glossary_entry'), {
      course_id: courseId,
      module_id: createdGlossary.course_module_id,
      entry_id: createdGlossaryEntry.entry_id
    });

    assert.equal(deletedGlossaryEntry.deleted, true);
    assert.equal(deletedGlossaryEntry.id, createdGlossaryEntry.entry_id);
    glossaryEntryDeleted = true;

    const deletedGlossary = await callRestFunction(toRestFunctionName(contract, 'delete_module'), {
      course_id: courseId,
      module_id: createdGlossary.course_module_id
    });

    assert.equal(deletedGlossary.deleted, true);
    assert.equal(deletedGlossary.id, createdGlossary.course_module_id);
    glossaryDeleted = true;

    const createdWiki = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: createdSection.section_number,
      module_type: 'wiki',
      name: wikiName,
      options: JSON.stringify({
        intro: '<p>REST wiki activity created by MoodlIA automated tests.</p>',
        first_page_title: wikiFirstPage,
        wiki_mode: 'collaborative',
        default_format: 'html'
      })
    });

    assert.equal(createdWiki.module_type, 'wiki');
    assert.equal(createdWiki.name, wikiName);
    assert.equal(typeof createdWiki.course_module_id, 'number');
    assert.match(createdWiki.url, /\/mod\/wiki\/view\.php\?id=/);

    const createdWikiPage = await callRestFunction(toRestFunctionName(contract, 'create_wiki_page'), {
      course_id: courseId,
      module_id: createdWiki.course_module_id,
      title: wikiPageTitle,
      content: wikiPageContent,
      content_format: 'html'
    });

    assert.equal(createdWikiPage.module_id, createdWiki.course_module_id);
    assert.equal(createdWikiPage.title, wikiPageTitle);
    assert.match(createdWikiPage.content, /Initial generated wiki content/);

    const listedWikiPages = await callRestFunction(toRestFunctionName(contract, 'get_wiki_pages'), {
      course_id: courseId,
      module_id: createdWiki.course_module_id,
      sort_by: 'title',
      sort_direction: 'ASC',
      include_content: 1
    });
    assert.ok(
      listedWikiPages.pages.some((page) => page.page_id === createdWikiPage.page_id),
      'created REST wiki page must be present in get_wiki_pages'
    );

    const updatedWikiPage = await callRestFunction(toRestFunctionName(contract, 'update_wiki_page'), {
      course_id: courseId,
      module_id: createdWiki.course_module_id,
      page_id: createdWikiPage.page_id,
      content: updatedWikiPageContent
    });

    assert.equal(updatedWikiPage.page_id, createdWikiPage.page_id);
    assert.match(updatedWikiPage.content, /Updated generated wiki content/);

    const wikiDetails = await callRestFunction(toRestFunctionName(contract, 'get_module_details'), {
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
      'wiki module details must include the updated page summary'
    );

    const deletedWiki = await callRestFunction(toRestFunctionName(contract, 'delete_module'), {
      course_id: courseId,
      module_id: createdWiki.course_module_id
    });

    assert.equal(deletedWiki.deleted, true);
    assert.equal(deletedWiki.id, createdWiki.course_module_id);
    wikiDeleted = true;

    const createdFolder = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: createdSection.section_number,
      module_type: 'folder',
      name: folderName,
      options: JSON.stringify({
        display: 'course',
        show_expanded: false,
        show_download_folder: false,
        force_download: true
      })
    });

    assert.equal(createdFolder.module_type, 'folder');
    assert.equal(createdFolder.name, folderName);
    assert.equal(typeof createdFolder.course_module_id, 'number');

    const courseContents = await callRestFunction(toRestFunctionName(contract, 'get_course_contents'), {
      course_id: courseId
    });
    const generatedSection = courseContents.sections.find((section) => section.section_id === updatedSection.section_id);
    assert.ok(generatedSection, 'updated generated section must be present in course contents');
    assert.ok(
      generatedSection.modules.some((module) => module.course_module_id === createdFolder.course_module_id),
      'created folder module must be present in course contents'
    );

    const uploadedFile = await callRestFunction(toRestFunctionName(contract, 'upload_folder_file'), {
      course_id: courseId,
      module_id: createdFolder.course_module_id,
      filename,
      upload_reference: Buffer.from(`Created by MoodlIA ${suffix}`, 'utf8').toString('base64')
    });

    assert.equal(uploadedFile.filename, filename);
    assert.equal(typeof uploadedFile.file_id, 'number');

    const listedFolderFiles = await callRestFunction(toRestFunctionName(contract, 'get_folder_files'), {
      course_id: courseId,
      module_id: createdFolder.course_module_id
    });
    assert.ok(
      listedFolderFiles.files.some((file) => file.file_id === uploadedFile.file_id && file.filename === filename),
      'uploaded file must be present in folder file listing'
    );

    const folderDetails = await callRestFunction(toRestFunctionName(contract, 'get_module_details'), {
      course_id: courseId,
      module_id: createdFolder.course_module_id
    });
    const folderExtra = JSON.parse(folderDetails.extra_json);
    assert.equal(folderDetails.module_type, 'folder');
    assert.equal(folderExtra.activity.folder_id, createdFolder.instance_id);
    assert.equal(folderExtra.activity.file_count, listedFolderFiles.files.length);
    assert.ok(folderExtra.activity.total_size > 0, 'folder details must expose total file size');
    assert.ok(
      folderExtra.activity.files.some((file) => file.file_id === uploadedFile.file_id && file.filename === filename),
      'folder details must expose uploaded file summaries'
    );

    const downloadedFile = await callRestFunction(toRestFunctionName(contract, 'download_folder_file'), {
      course_id: courseId,
      module_id: createdFolder.course_module_id,
      file_id: uploadedFile.file_id
    });

    assert.equal(downloadedFile.file_id, uploadedFile.file_id);
    assert.equal(downloadedFile.filename, filename);

    const deletedFile = await callRestFunction(toRestFunctionName(contract, 'delete_folder_file'), {
      course_id: courseId,
      module_id: createdFolder.course_module_id,
      file_id: uploadedFile.file_id
    });

    assert.equal(deletedFile.deleted, true);
    assert.equal(deletedFile.id, uploadedFile.file_id);
    fileDeleted = true;

    const deletedFolder = await callRestFunction(toRestFunctionName(contract, 'delete_module'), {
      course_id: courseId,
      module_id: createdFolder.course_module_id
    });

    assert.equal(deletedFolder.deleted, true);
    assert.equal(deletedFolder.id, createdFolder.course_module_id);
    folderDeleted = true;

    const createdCategory = await callRestFunction(toRestFunctionName(contract, 'create_question_category'), {
      course_id: courseId,
      name: categoryName,
      description: 'Created by MoodlIA automated tests.'
    });

    assert.equal(createdCategory.name, categoryName);
    assert.equal(typeof createdCategory.category_id, 'number');
    assert.equal(createdCategory.bank_scope, 'course_shared');
    assert.equal(typeof createdCategory.question_bank_module_id, 'number');
    assert.equal(createdCategory.quiz_module_id, null);

    const listedSharedBanks = await callRestFunction(toRestFunctionName(contract, 'get_question_banks'), {
      course_id: courseId,
      include_quiz_private: 0
    });
    assert.ok(
      listedSharedBanks.banks.some((bank) => bank.question_bank_module_id === createdCategory.question_bank_module_id),
      'created course shared question bank must be listed'
    );

    const listedSharedCategories = await callRestFunction(toRestFunctionName(contract, 'get_question_categories'), {
      course_id: courseId,
      bank_scope: 'course_shared',
      question_bank_module_id: createdCategory.question_bank_module_id
    });
    assert.ok(
      listedSharedCategories.categories.some((category) => category.category_id === createdCategory.category_id),
      'created course shared question category must be listed'
    );

    const updatedCategory = await callRestFunction(toRestFunctionName(contract, 'update_question_category'), {
      category_id: createdCategory.category_id,
      context_id: createdCategory.context_id,
      name: updatedCategoryName,
      description: 'Updated by MoodlIA automated tests.'
    });

    assert.equal(updatedCategory.category_id, createdCategory.category_id);
    assert.equal(updatedCategory.name, updatedCategoryName);

    const emptyCategory = await callRestFunction(toRestFunctionName(contract, 'create_question_category'), {
      course_id: courseId,
      name: emptyCategoryName
    });

    assert.equal(emptyCategory.bank_scope, 'course_shared');
    assert.equal(typeof emptyCategory.question_bank_module_id, 'number');
    assert.equal(emptyCategory.quiz_module_id, null);

    const deletedEmptyCategory = await callRestFunction(toRestFunctionName(contract, 'delete_question_category'), {
      category_id: emptyCategory.category_id,
      context_id: emptyCategory.context_id,
      delete_mode: 'delete'
    });

    assert.equal(deletedEmptyCategory.deleted, true);
    assert.equal(deletedEmptyCategory.id, emptyCategory.category_id);
    emptyCategoryDeleted = true;

    const createdQuestion = await callRestFunction(toRestFunctionName(contract, 'create_question'), {
      category_id: createdCategory.category_id,
      context_id: createdCategory.context_id,
      question_type: 'truefalse',
      name: questionName,
      question_text: '<p>Is this question generated by MoodlIA?</p>',
      options: JSON.stringify({
        correct_answer: true,
        feedback_true: 'Correct.',
        feedback_false: 'Incorrect.'
      })
    });

    assert.equal(createdQuestion.category_id, createdCategory.category_id);
    assert.equal(createdQuestion.question_type, 'truefalse');
    assert.equal(createdQuestion.name, questionName);
    assert.equal(typeof createdQuestion.question_id, 'number');

    const updatedQuestion = await callRestFunction(toRestFunctionName(contract, 'update_question'), {
      question_id: createdQuestion.question_id,
      name: updatedQuestionName,
      question_text: '<p>Was this question updated by MoodlIA?</p>',
      options: JSON.stringify({
        correct_answer: false,
        feedback_true: 'No longer correct.',
        feedback_false: 'Correct after update.'
      })
    });

    assert.equal(updatedQuestion.question_type, 'truefalse');
    assert.equal(updatedQuestion.name, updatedQuestionName);
    assert.equal(typeof updatedQuestion.question_id, 'number');

    const createdShortAnswer = await callRestFunction(toRestFunctionName(contract, 'create_question'), {
      category_id: createdCategory.category_id,
      context_id: createdCategory.context_id,
      question_type: 'shortanswer',
      name: shortAnswerName,
      question_text: '<p>Write the keyword generated by MoodlIA.</p>',
      options: JSON.stringify({
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
    });

    assert.equal(createdShortAnswer.category_id, createdCategory.category_id);
    assert.equal(createdShortAnswer.question_type, 'shortanswer');
    assert.equal(createdShortAnswer.name, shortAnswerName);
    assert.equal(typeof createdShortAnswer.question_id, 'number');

    const updatedShortAnswer = await callRestFunction(toRestFunctionName(contract, 'update_question'), {
      question_id: createdShortAnswer.question_id,
      name: updatedShortAnswerName,
      question_text: '<p>Write the updated keyword generated by MoodlIA.</p>',
      options: JSON.stringify({
        answers: [
          {
            text: 'Updated MoodlIA',
            fraction: 1,
            feedback: 'Correct after update.'
          }
        ],
        case_sensitive: false
      })
    });

    assert.equal(updatedShortAnswer.question_type, 'shortanswer');
    assert.equal(updatedShortAnswer.name, updatedShortAnswerName);
    assert.equal(typeof updatedShortAnswer.question_id, 'number');

    const createdMultichoice = await callRestFunction(toRestFunctionName(contract, 'create_question'), {
      category_id: createdCategory.category_id,
      context_id: createdCategory.context_id,
      question_type: 'multichoice',
      name: multichoiceName,
      question_text: '<p>Choose the generated MoodlIA option.</p>',
      options: JSON.stringify({
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
    });

    assert.equal(createdMultichoice.category_id, createdCategory.category_id);
    assert.equal(createdMultichoice.question_type, 'multichoice');
    assert.equal(createdMultichoice.name, multichoiceName);
    assert.equal(typeof createdMultichoice.question_id, 'number');

    const updatedMultichoice = await callRestFunction(toRestFunctionName(contract, 'update_question'), {
      question_id: createdMultichoice.question_id,
      name: updatedMultichoiceName,
      question_text: '<p>Choose the updated generated MoodlIA option.</p>',
      options: JSON.stringify({
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
    });

    assert.equal(updatedMultichoice.question_type, 'multichoice');
    assert.equal(updatedMultichoice.name, updatedMultichoiceName);
    assert.equal(typeof updatedMultichoice.question_id, 'number');

    const createdNumerical = await callRestFunction(toRestFunctionName(contract, 'create_question'), {
      category_id: createdCategory.category_id,
      context_id: createdCategory.context_id,
      question_type: 'numerical',
      name: numericalName,
      question_text: '<p>Enter the generated numeric value from MoodlIA.</p>',
      options: JSON.stringify({
        answers: [
          {
            text: '42',
            tolerance: '0.01',
            fraction: 1,
            feedback: 'Correct.'
          }
        ]
      })
    });

    assert.equal(createdNumerical.category_id, createdCategory.category_id);
    assert.equal(createdNumerical.question_type, 'numerical');
    assert.equal(createdNumerical.name, numericalName);
    assert.equal(typeof createdNumerical.question_id, 'number');

    const updatedNumerical = await callRestFunction(toRestFunctionName(contract, 'update_question'), {
      question_id: createdNumerical.question_id,
      name: updatedNumericalName,
      question_text: '<p>Enter the updated generated numeric value from MoodlIA.</p>',
      options: JSON.stringify({
        answers: [
          {
            text: '43',
            tolerance: '0.01',
            fraction: 1,
            feedback: 'Correct after update.'
          }
        ]
      })
    });

    assert.equal(updatedNumerical.question_type, 'numerical');
    assert.equal(updatedNumerical.name, updatedNumericalName);
    assert.equal(typeof updatedNumerical.question_id, 'number');

    const createdMatching = await callRestFunction(toRestFunctionName(contract, 'create_question'), {
      category_id: createdCategory.category_id,
      context_id: createdCategory.context_id,
      question_type: 'matching',
      name: matchingName,
      question_text: '<p>Match each generated Moodle concept with its meaning.</p>',
      options: JSON.stringify({
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
        correct_feedback: 'All pairs are correct.',
        incorrect_feedback: 'Review the generated interfaces.'
      })
    });

    assert.equal(createdMatching.category_id, createdCategory.category_id);
    assert.equal(createdMatching.question_type, 'matching');
    assert.equal(createdMatching.name, matchingName);
    assert.equal(typeof createdMatching.question_id, 'number');

    const updatedMatching = await callRestFunction(toRestFunctionName(contract, 'update_question'), {
      question_id: createdMatching.question_id,
      name: updatedMatchingName,
      question_text: '<p>Match each updated Moodle concept with its meaning.</p>',
      options: JSON.stringify({
        shuffle_answers: false,
        subquestions: [
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
        correct_feedback: 'Updated pairs are correct.',
        incorrect_feedback: 'Review the updated banks.'
      })
    });

    assert.equal(updatedMatching.question_type, 'matching');
    assert.equal(updatedMatching.name, updatedMatchingName);
    assert.equal(typeof updatedMatching.question_id, 'number');

    const createdEssay = await callRestFunction(toRestFunctionName(contract, 'create_question'), {
      category_id: createdCategory.category_id,
      context_id: createdCategory.context_id,
      question_type: 'essay',
      name: essayName,
      question_text: '<p>Explain how MoodlIA creates Moodle content.</p>',
      options: JSON.stringify({
        response_format: 'plain',
        response_required: true,
        response_field_lines: 10,
        response_template: 'Write a concise explanation.',
        grader_info: '<p>Look for REST, MCP, and CLI parity.</p>'
      })
    });

    assert.equal(createdEssay.category_id, createdCategory.category_id);
    assert.equal(createdEssay.question_type, 'essay');
    assert.equal(createdEssay.name, essayName);
    assert.equal(typeof createdEssay.question_id, 'number');

    const updatedEssay = await callRestFunction(toRestFunctionName(contract, 'update_question'), {
      question_id: createdEssay.question_id,
      name: updatedEssayName,
      question_text: '<p>Explain how MoodlIA keeps Moodle content generation verifiable.</p>',
      options: JSON.stringify({
        response_format: 'plain',
        response_required: true,
        response_field_lines: 12,
        response_template: 'Mention browser verification.',
        grader_info: '<p>Look for browser-visible verification details.</p>'
      })
    });

    assert.equal(updatedEssay.question_type, 'essay');
    assert.equal(updatedEssay.name, updatedEssayName);
    assert.equal(typeof updatedEssay.question_id, 'number');

    const listedQuestions = await callRestFunction(toRestFunctionName(contract, 'get_questions'), {
      course_id: courseId,
      category_id: createdCategory.category_id,
      question_bank_module_id: createdCategory.question_bank_module_id
    });
    assert.ok(
      listedQuestions.questions.some((question) =>
        question.question_id === updatedQuestion.question_id &&
        question.name === updatedQuestionName &&
        question.question_type === 'truefalse' &&
        question.question_text.includes('Was this question updated by MoodlIA?')
      ),
      'REST get_questions must list updated truefalse questions in the category'
    );
    assert.ok(
      listedQuestions.questions.some((question) =>
        question.question_id === updatedMatching.question_id &&
        question.name === updatedMatchingName &&
        question.question_type === 'matching'
      ),
      'REST get_questions must expose matching questions with canonical question_type'
    );

    const moveTargetCategory = await callRestFunction(toRestFunctionName(contract, 'create_question_category'), {
      course_id: courseId,
      name: moveTargetCategoryName,
      question_bank_module_id: createdCategory.question_bank_module_id,
      description: 'Target category for MoodlIA REST move_question tests.'
    });

    assert.equal(moveTargetCategory.name, moveTargetCategoryName);
    assert.equal(moveTargetCategory.question_bank_module_id, createdCategory.question_bank_module_id);

    const movableQuestion = await callRestFunction(toRestFunctionName(contract, 'create_question'), {
      category_id: createdCategory.category_id,
      context_id: createdCategory.context_id,
      question_type: 'truefalse',
      name: movableQuestionName,
      question_text: '<p>This question will be moved by MoodlIA REST tests.</p>',
      options: JSON.stringify({
        correct_answer: true
      })
    });

    const movedQuestion = await callRestFunction(toRestFunctionName(contract, 'move_question'), {
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

    const sourceQuestionsAfterMove = await callRestFunction(toRestFunctionName(contract, 'get_questions'), {
      course_id: courseId,
      category_id: createdCategory.category_id,
      question_bank_module_id: createdCategory.question_bank_module_id
    });
    assert.equal(
      sourceQuestionsAfterMove.questions.some((question) => question.question_id === movableQuestion.question_id),
      false,
      'REST move_question must remove the question from the source category listing'
    );

    const targetQuestionsAfterMove = await callRestFunction(toRestFunctionName(contract, 'get_questions'), {
      course_id: courseId,
      category_id: moveTargetCategory.category_id,
      question_bank_module_id: createdCategory.question_bank_module_id
    });
    assert.ok(
      targetQuestionsAfterMove.questions.some((question) =>
        question.question_id === movableQuestion.question_id &&
        question.name === movableQuestionName
      ),
      'REST move_question must add the question to the target category listing'
    );

    const deletableQuestion = await callRestFunction(toRestFunctionName(contract, 'create_question'), {
      category_id: createdCategory.category_id,
      context_id: createdCategory.context_id,
      question_type: 'truefalse',
      name: deletedQuestionName,
      question_text: '<p>This question will be deleted by MoodlIA REST tests.</p>',
      options: JSON.stringify({
        correct_answer: true
      })
    });

    const listedQuestionsBeforeDelete = await callRestFunction(toRestFunctionName(contract, 'get_questions'), {
      course_id: courseId,
      category_id: createdCategory.category_id,
      question_bank_module_id: createdCategory.question_bank_module_id
    });
    assert.ok(
      listedQuestionsBeforeDelete.questions.some((question) => question.question_id === deletableQuestion.question_id),
      'REST get_questions must list a newly created deletable question'
    );

    const deletedQuestion = await callRestFunction(toRestFunctionName(contract, 'delete_question'), {
      question_id: deletableQuestion.question_id
    });
    assert.equal(deletedQuestion.deleted, true);
    assert.equal(deletedQuestion.id, deletableQuestion.question_id);

    const listedQuestionsAfterDelete = await callRestFunction(toRestFunctionName(contract, 'get_questions'), {
      course_id: courseId,
      category_id: createdCategory.category_id,
      question_bank_module_id: createdCategory.question_bank_module_id
    });
    assert.equal(
      listedQuestionsAfterDelete.questions.some((question) => question.question_id === deletableQuestion.question_id),
      false,
      'REST get_questions must not list a deleted question'
    );

    const createdQuiz = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: createdSection.section_number,
      module_type: 'quiz',
      name: quizName,
      options: JSON.stringify({
        intro: '<p>REST quiz activity created by MoodlIA automated tests.</p>',
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
    });

    assert.equal(createdQuiz.module_type, 'quiz');
    assert.equal(createdQuiz.name, quizName);
    assert.equal(typeof createdQuiz.course_module_id, 'number');

    const privateCategory = await callRestFunction(toRestFunctionName(contract, 'create_question_category'), {
      course_id: courseId,
      name: privateCategoryName,
      bank_scope: 'quiz_private',
      quiz_module_id: createdQuiz.course_module_id,
      description: 'Created in the quiz-private bank by MoodlIA automated tests.'
    });

    assert.equal(privateCategory.name, privateCategoryName);
    assert.equal(privateCategory.bank_scope, 'quiz_private');
    assert.equal(privateCategory.question_bank_module_id, null);
    assert.equal(privateCategory.quiz_module_id, createdQuiz.course_module_id);

    const listedQuizBanks = await callRestFunction(toRestFunctionName(contract, 'get_question_banks'), {
      course_id: courseId
    });
    assert.ok(
      listedQuizBanks.banks.some((bank) => bank.quiz_module_id === createdQuiz.course_module_id),
      'created quiz-private question bank must be listed'
    );

    const listedPrivateCategories = await callRestFunction(toRestFunctionName(contract, 'get_question_categories'), {
      course_id: courseId,
      bank_scope: 'quiz_private',
      quiz_module_id: createdQuiz.course_module_id
    });
    assert.ok(
      listedPrivateCategories.categories.some((category) => category.category_id === privateCategory.category_id),
      'created quiz-private question category must be listed'
    );

    const privateQuestion = await callRestFunction(toRestFunctionName(contract, 'create_question'), {
      category_id: privateCategory.category_id,
      context_id: privateCategory.context_id,
      question_type: 'truefalse',
      name: privateQuestionName,
      question_text: '<p>Is this question stored in the quiz-private bank?</p>',
      options: JSON.stringify({
        correct_answer: true,
        feedback_true: 'Correct.',
        feedback_false: 'Incorrect.'
      })
    });

    assert.equal(privateQuestion.category_id, privateCategory.category_id);
    assert.equal(privateQuestion.question_type, 'truefalse');

    const quizQuestion = await callRestFunction(toRestFunctionName(contract, 'add_question_to_quiz'), {
      quiz_module_id: createdQuiz.course_module_id,
      question_id: privateQuestion.question_id
    });

    assert.equal(quizQuestion.question_id, privateQuestion.question_id);
    assert.equal(typeof quizQuestion.quiz_id, 'number');
    assert.equal(typeof quizQuestion.slot, 'number');
    assert.equal(typeof quizQuestion.maxmark, 'number');
    assert.ok(quizQuestion.maxmark > 0, 'Quiz questions must have a positive slot maxmark.');

    const listedQuizQuestions = await callRestFunction(toRestFunctionName(contract, 'get_quiz_questions'), {
      quiz_module_id: createdQuiz.course_module_id
    });
    assert.ok(
      listedQuizQuestions.questions.some((question) =>
        question.question_id === privateQuestion.question_id &&
        question.slot === quizQuestion.slot &&
        question.maxmark > 0
      ),
      'added quiz question must be present in quiz question listing'
    );

    const updatedQuizQuestionSlot = await callRestFunction(toRestFunctionName(contract, 'update_quiz_question_slot'), {
      quiz_module_id: createdQuiz.course_module_id,
      slot: quizQuestion.slot,
      max_mark: 2.5
    });
    assert.equal(updatedQuizQuestionSlot.updated, true);
    assert.equal(updatedQuizQuestionSlot.quiz_module_id, createdQuiz.course_module_id);
    assert.equal(updatedQuizQuestionSlot.slot, quizQuestion.slot);
    assert.equal(updatedQuizQuestionSlot.question_id, privateQuestion.question_id);
    assert.equal(updatedQuizQuestionSlot.maxmark, 2.5);

    const listedQuizQuestionsAfterSlotUpdate = await callRestFunction(toRestFunctionName(contract, 'get_quiz_questions'), {
      quiz_module_id: createdQuiz.course_module_id
    });
    assert.ok(
      listedQuizQuestionsAfterSlotUpdate.questions.some((question) =>
        question.question_id === privateQuestion.question_id &&
        question.slot === quizQuestion.slot &&
        question.maxmark === 2.5
      ),
      'REST update_quiz_question_slot must update the slot maxmark in quiz question listing'
    );

    const removableQuizQuestion = await callRestFunction(toRestFunctionName(contract, 'create_question'), {
      category_id: privateCategory.category_id,
      context_id: privateCategory.context_id,
      question_type: 'truefalse',
      name: removableQuizQuestionName,
      question_text: '<p>Will this question be removed from the quiz?</p>',
      options: JSON.stringify({
        correct_answer: true
      })
    });

    const removableQuizSlot = await callRestFunction(toRestFunctionName(contract, 'add_question_to_quiz'), {
      quiz_module_id: createdQuiz.course_module_id,
      question_id: removableQuizQuestion.question_id
    });
    assert.equal(removableQuizSlot.question_id, removableQuizQuestion.question_id);

    const removedQuizQuestion = await callRestFunction(toRestFunctionName(contract, 'remove_question_from_quiz'), {
      quiz_module_id: createdQuiz.course_module_id,
      slot: removableQuizSlot.slot
    });
    assert.equal(removedQuizQuestion.removed, true);
    assert.equal(removedQuizQuestion.question_id, removableQuizQuestion.question_id);
    assert.equal(removedQuizQuestion.slot, removableQuizSlot.slot);

    const listedQuizQuestionsAfterRemove = await callRestFunction(toRestFunctionName(contract, 'get_quiz_questions'), {
      quiz_module_id: createdQuiz.course_module_id
    });
    assert.equal(
      listedQuizQuestionsAfterRemove.questions.some((question) => question.question_id === removableQuizQuestion.question_id),
      false,
      'REST removed quiz question must not be present in quiz question listing'
    );
    assert.ok(
      listedQuizQuestionsAfterRemove.questions.some((question) => question.question_id === privateQuestion.question_id),
      'REST remove_question_from_quiz must leave other quiz questions in place'
    );

    const randomQuizQuestions = await callRestFunction(toRestFunctionName(contract, 'add_random_questions_to_quiz'), {
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
    assert.ok(randomQuizQuestions.slots[0].maxmark > 0, 'REST random quiz slot must have a positive maxmark');

    const listedQuizQuestionsAfterRandom = await callRestFunction(toRestFunctionName(contract, 'get_quiz_questions'), {
      quiz_module_id: createdQuiz.course_module_id
    });
    assert.ok(
      listedQuizQuestionsAfterRandom.questions.some((question) =>
        question.slot === randomQuizQuestions.slots[0].slot &&
        question.question_type === 'random'
      ),
      'REST random quiz slot must be present in quiz question listing'
    );
    assert.ok(
      listedQuizQuestionsAfterRandom.questions.some((question) => question.question_id === privateQuestion.question_id),
      'REST add_random_questions_to_quiz must leave explicitly added questions in place'
    );

    const quizDetails = await callRestFunction(toRestFunctionName(contract, 'get_module_details'), {
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
    assert.ok(quizExtra.activity.sumgrades > 0, 'quiz details must expose positive sumgrades after adding a question');

    const startedQuizAttempt = await callRestFunction(toRestFunctionName(contract, 'start_quiz_attempt'), {
      quiz_module_id: createdQuiz.course_module_id
    });
    assert.equal(startedQuizAttempt.quiz_id, quizQuestion.quiz_id);
    assert.equal(startedQuizAttempt.quiz_module_id, createdQuiz.course_module_id);
    assert.ok(startedQuizAttempt.attempt.attempt_id > 0, 'REST quiz attempt id must be positive.');
    assert.equal(startedQuizAttempt.attempt.quiz_id, quizQuestion.quiz_id);
    assert.equal(startedQuizAttempt.attempt.user_id, currentUser.id);
    assert.equal(startedQuizAttempt.attempt.state, 'inprogress');

    const listedQuizAttempts = await callRestFunction(toRestFunctionName(contract, 'get_quiz_attempts'), {
      quiz_module_id: createdQuiz.course_module_id,
      user_id: currentUser.id,
      status: 'all',
      include_previews: 1
    });
    assert.ok(
      listedQuizAttempts.attempts.some((attempt) =>
        attempt.attempt_id === startedQuizAttempt.attempt.attempt_id &&
        attempt.state === 'inprogress'
      ),
      'started REST quiz attempt must be present in quiz attempt listing'
    );

    const deletedQuiz = await callRestFunction(toRestFunctionName(contract, 'delete_module'), {
      course_id: courseId,
      module_id: createdQuiz.course_module_id
    });

    assert.equal(deletedQuiz.deleted, true);
    assert.equal(deletedQuiz.id, createdQuiz.course_module_id);
    quizDeleted = true;

    const deletedSection = await callRestFunction(toRestFunctionName(contract, 'delete_section'), {
      course_id: courseId,
      section_id: createdSection.section_id,
      delete_mode: 'delete'
    });

    assert.equal(deletedSection.deleted, true);
    assert.equal(deletedSection.id, createdSection.section_id);
    sectionDeleted = true;

    const deletedCalendarEvent = await callRestFunction(toRestFunctionName(contract, 'delete_calendar_event'), {
      course_id: courseId,
      event_id: calendarEventId
    });

    assert.equal(deletedCalendarEvent.deleted, true);
    assert.equal(deletedCalendarEvent.id, calendarEventId);
    calendarEventDeleted = true;
    calendarEventId = null;

    const deletedCourse = await callRestFunction(toRestFunctionName(contract, 'delete_course'), {
      course_id: courseId
    });

    assert.equal(deletedCourse.deleted, true);
    assert.equal(deletedCourse.id, courseId);
    courseId = null;

    const deletedCourseCategory = await callRestFunction(toRestFunctionName(contract, 'delete_course_category'), {
      category_id: courseCategoryId
    });

    assert.equal(deletedCourseCategory.deleted, true);
    assert.equal(deletedCourseCategory.id, courseCategoryId);
    courseCategoryDeleted = true;
    courseCategoryId = null;
  } catch (error) {
    if (courseId) {
      console.error(`Generated course left in Moodle for inspection: ${courseId}`);
      if (!moduleDeleted) {
        console.error('Module cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!duplicatedModuleDeleted) {
        console.error('Duplicated module cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!userUnenrolled) {
        console.error('User unenrolment cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!groupMemberRemoved) {
        console.error('Group member cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!groupRemovedFromGrouping) {
        console.error('Grouping membership cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!groupingDeleted) {
        console.error('Grouping cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!groupDeleted) {
        console.error('Group cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!assignDeleted) {
        console.error('Assignment cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!bookDeleted) {
        console.error('Book cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!labelDeleted) {
        console.error('Label cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!urlDeleted) {
        console.error('URL cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!forumDeleted) {
        console.error('Forum cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!glossaryEntryDeleted) {
        console.error('Glossary entry cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!glossaryDeleted) {
        console.error('Glossary cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!wikiDeleted) {
        console.error('Wiki cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!fileDeleted) {
        console.error('File cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!folderDeleted) {
        console.error('Folder cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!emptyCategoryDeleted) {
        console.error('Empty question category cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!quizDeleted) {
        console.error('Quiz cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!sectionDeleted) {
        console.error('Section cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!calendarEventDeleted) {
        console.error('Calendar event cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
    }
    if (calendarEventId && !calendarEventDeleted) {
      console.error(`Generated calendar event left in Moodle for inspection: ${calendarEventId}`);
    }
    if (courseCategoryId && !courseCategoryDeleted) {
      console.error(`Generated course category left in Moodle for inspection: ${courseCategoryId}`);
    }
    throw error;
  }
});
