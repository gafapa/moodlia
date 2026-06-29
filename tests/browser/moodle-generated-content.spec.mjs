import { test, expect } from '@playwright/test';
import { loadContract, toRestFunctionName } from '../helpers/contract.mjs';
import { requireEnv } from '../helpers/env.mjs';
import { callRestFunction } from '../helpers/moodle-rest.mjs';
import { expectMoodlePageLoaded, loginAsConfiguredUser } from './helpers/moodle-ui.mjs';

const hasBrowserConfig = Boolean(process.env.PLAYWRIGHT_BASE_URL || process.env.MOODLE_BASE_URL);
const hasLoginConfig = Boolean(process.env.MOODLE_USERNAME && process.env.MOODLE_PASSWORD);
const hasRestConfig = requireEnv(['MOODLE_BASE_URL', 'MOODLE_REST_TOKEN']);

test.skip(
  !hasBrowserConfig || !hasLoginConfig || !hasRestConfig,
  'Set Moodle URL, Moodle login credentials, and REST token to run detailed browser verification.'
);

test.describe.serial('Moodle generated content browser details', () => {
  let contract;
  let fixture;
  let shouldCleanup = true;

  async function call(operationName, parameters = {}) {
    return callRestFunction(toRestFunctionName(contract, operationName), parameters);
  }

  test.beforeAll(async () => {
    contract = await loadContract();

    const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const courseCategoryName = `MoodlIA Browser Course Category ${suffix}`;
    const updatedCourseCategoryName = `MoodlIA Browser Updated Category ${suffix}`;
    const courseName = `MoodlIA Browser Detail Course ${suffix}`;
    const courseShortname = `moodlia-browser-detail-${suffix}`;
    const courseSummary = `MoodlIA browser course summary ${suffix}`;
    const calendarEventName = `MoodlIA Browser Calendar Event ${suffix}`;
    const updatedCalendarEventName = `MoodlIA Browser Updated Calendar Event ${suffix}`;
    const calendarEventDescription = `MoodlIA browser calendar description ${suffix}`;
    const updatedCalendarEventDescription = `MoodlIA browser updated calendar description ${suffix}`;
    const calendarEventStart = Math.floor(Date.now() / 1000) + 172800;
    const updatedCalendarEventStart = calendarEventStart + 3600;
    const courseStart = calendarEventStart - 86400;
    const courseEnd = calendarEventStart + 604800;
    const groupName = `MoodlIA Browser Detail Group ${suffix}`;
    const groupDescription = `MoodlIA browser group description ${suffix}`;
    const sectionName = `MoodlIA Browser Detail Section ${suffix}`;
    const sectionSummary = `MoodlIA browser section summary ${suffix}`;
    const subsectionName = `MoodlIA Browser Detail Subsection ${suffix}`;
    const pageName = `MoodlIA Browser Detail Page ${suffix}`;
    const pageHeading = `MoodlIA browser page heading ${suffix}`;
    const pageListItem = `MoodlIA browser page list item ${suffix}`;
    const stealthPageName = `MoodlIA Browser Stealth Page ${suffix}`;
    const stealthPageHeading = `MoodlIA browser stealth page heading ${suffix}`;
    const assignName = `MoodlIA Browser Detail Assignment ${suffix}`;
    const assignIntro = `MoodlIA browser assignment intro ${suffix}`;
    const assignmentSubmissionText = `MoodlIA browser assignment submission ${suffix}`;
    const assignmentGrade = 92.5;
    const assignmentFeedbackComment = `MoodlIA browser assignment feedback ${suffix}`;
    const bookName = `MoodlIA Browser Detail Book ${suffix}`;
    const bookIntro = `MoodlIA browser book intro ${suffix}`;
    const labelName = `MoodlIA Browser Detail Label ${suffix}`;
    const labelHeading = `MoodlIA browser label heading ${suffix}`;
    const labelListItem = `MoodlIA browser label list item ${suffix}`;
    const urlName = `MoodlIA Browser Detail URL ${suffix}`;
    const urlIntro = `MoodlIA browser URL intro ${suffix}`;
    const urlExternalUrl = `https://example.com/moodlia-browser-${suffix}`;
    const ltiName = `MoodlIA Browser Detail LTI ${suffix}`;
    const ltiIntro = `MoodlIA browser LTI intro ${suffix}`;
    const ltiToolUrl = `https://example.com/moodlia-browser-lti-${suffix}`;
    const choiceName = `MoodlIA Browser Detail Choice ${suffix}`;
    const choiceIntro = `MoodlIA browser choice intro ${suffix}`;
    const choiceOptionOne = `MoodlIA browser choice one ${suffix}`;
    const choiceOptionTwo = `MoodlIA browser choice two ${suffix}`;
    const choiceOptionThree = `MoodlIA browser choice three ${suffix}`;
    const dataName = `MoodlIA Browser Detail Database ${suffix}`;
    const dataIntro = `MoodlIA browser database intro ${suffix}`;
    const dataTitleFieldName = `MoodlIA Browser Title ${suffix}`;
    const dataStatusFieldName = `MoodlIA Browser Status ${suffix}`;
    const dataNotesFieldName = `MoodlIA Browser Notes ${suffix}`;
    const dataEntryTitle = `MoodlIA browser database entry ${suffix}`;
    const updatedDataEntryTitle = `MoodlIA browser updated database entry ${suffix}`;
    const dataEntryNotes = `MoodlIA browser database notes ${suffix}`;
    const updatedDataEntryNotes = `MoodlIA browser updated database notes ${suffix}`;
    const lessonName = `MoodlIA Browser Detail Lesson ${suffix}`;
    const lessonIntro = `MoodlIA browser lesson intro ${suffix}`;
    const workshopName = `MoodlIA Browser Detail Workshop ${suffix}`;
    const workshopIntro = `MoodlIA browser workshop intro ${suffix}`;
    const workshopSubmissionTitle = `MoodlIA Browser Workshop Submission ${suffix}`;
    const updatedWorkshopSubmissionTitle = `MoodlIA Browser Updated Workshop Submission ${suffix}`;
    const workshopSubmissionContent = `MoodlIA browser workshop submission ${suffix}`;
    const updatedWorkshopSubmissionContent = `MoodlIA browser updated workshop submission ${suffix}`;
    const forumName = `MoodlIA Browser Detail Forum ${suffix}`;
    const forumIntro = `MoodlIA browser forum intro ${suffix}`;
    const forumDiscussionName = `MoodlIA Browser Discussion ${suffix}`;
    const forumDiscussionMessage = `MoodlIA browser discussion message ${suffix}`;
    const forumReplySubject = `MoodlIA Browser Reply ${suffix}`;
    const forumReplyMessage = `MoodlIA browser reply message ${suffix}`;
    const updatedForumReplySubject = `MoodlIA Browser Updated Reply ${suffix}`;
    const updatedForumReplyMessage = `MoodlIA browser updated reply message ${suffix}`;
    const glossaryName = `MoodlIA Browser Detail Glossary ${suffix}`;
    const glossaryIntro = `MoodlIA browser glossary intro ${suffix}`;
    const glossaryConcept = `MoodlIA browser glossary concept ${suffix}`;
    const updatedGlossaryConcept = `MoodlIA browser updated glossary concept ${suffix}`;
    const glossaryDefinition = `MoodlIA browser glossary definition ${suffix}`;
    const updatedGlossaryDefinition = `MoodlIA browser updated glossary definition ${suffix}`;
    const wikiName = `MoodlIA Browser Detail Wiki ${suffix}`;
    const wikiIntro = `MoodlIA browser wiki intro ${suffix}`;
    const wikiFirstPage = `MoodlIA Browser Wiki Home ${suffix}`;
    const wikiPageTitle = `MoodlIA Browser Wiki Page ${suffix}`;
    const wikiPageContent = `MoodlIA browser wiki page content ${suffix}`;
    const updatedWikiPageContent = `MoodlIA browser updated wiki page content ${suffix}`;
    const folderName = `MoodlIA Browser Detail Folder ${suffix}`;
    const filename = `moodlia-browser-detail-${suffix}.txt`;
    const fileContent = `MoodlIA browser file content ${suffix}`;
    const resourceName = `MoodlIA Browser Detail Resource ${suffix}`;
    const resourceIntro = `MoodlIA browser resource intro ${suffix}`;
    const resourceFilename = `moodlia-browser-resource-${suffix}.txt`;
    const resourceFileContent = `MoodlIA browser resource file content ${suffix}`;
    const qbankName = `MoodlIA Browser Detail Question Bank ${suffix}`;
    const quizName = `MoodlIA Browser Detail Quiz ${suffix}`;
    const sharedCategoryName = `MoodlIA Browser Shared Questions ${suffix}`;
    const moveTargetCategoryName = `MoodlIA Browser Move Target Questions ${suffix}`;
    const privateCategoryName = `MoodlIA Browser Private Questions ${suffix}`;
    const trueFalseQuestionName = `MoodlIA Browser True False ${suffix}`;
    const trueFalseQuestionText = `Is this generated true/false question visible in Moodle ${suffix}?`;
    const movableQuestionName = `MoodlIA Browser Movable Question ${suffix}`;
    const randomPoolQuestionName = `MoodlIA Browser Random Pool Question ${suffix}`;
    const randomPoolQuestionText = `This question remains available for the random quiz slot ${suffix}.`;
    const removableQuizQuestionName = `MoodlIA Browser Removed Quiz Question ${suffix}`;
    const shortAnswerQuestionName = `MoodlIA Browser Short Answer ${suffix}`;
    const shortAnswerQuestionText = `Write the generated keyword for browser verification ${suffix}.`;
    const multichoiceQuestionName = `MoodlIA Browser Multichoice ${suffix}`;
    const multichoiceQuestionText = `Choose the generated option for browser verification ${suffix}.`;
    const multichoiceCorrectAnswer = `Browser generated option ${suffix}`;
    const multichoiceDistractorOne = `Browser distractor one ${suffix}`;
    const multichoiceDistractorTwo = `Browser distractor two ${suffix}`;
    const numericalQuestionName = `MoodlIA Browser Numerical ${suffix}`;
    const numericalQuestionText = `Enter the generated number for browser verification ${suffix}.`;
    const matchingQuestionName = `MoodlIA Browser Matching ${suffix}`;
    const matchingQuestionText = `Match the generated MoodlIA interfaces ${suffix}.`;
    const matchingStemOne = `Browser REST stem ${suffix}`;
    const matchingStemTwo = `Browser MCP stem ${suffix}`;
    const matchingStemThree = `Browser CLI stem ${suffix}`;
    const matchingAnswerOne = `Browser HTTP answer ${suffix}`;
    const matchingAnswerTwo = `Browser tool answer ${suffix}`;
    const matchingAnswerThree = `Browser terminal answer ${suffix}`;
    const essayQuestionName = `MoodlIA Browser Essay ${suffix}`;
    const essayQuestionText = `Explain the generated browser verification workflow ${suffix}.`;
    const essayResponseTemplate = `Browser essay response template ${suffix}`;
    let courseCategory;
    let course;
    let calendarEvent;

    try {
      const createdCourseCategory = await call('create_course_category', {
        name: courseCategoryName,
        visible: 1
      });

      courseCategory = await call('update_course_category', {
        category_id: createdCourseCategory.category_id,
        name: updatedCourseCategoryName,
        visible: 1
      });

      const listedCourseCategories = await call('get_course_categories', {
        parent_id: -1
      });
      expect(
        listedCourseCategories.categories.some((category) =>
          category.category_id === courseCategory.category_id &&
          category.name === updatedCourseCategoryName
        )
      ).toBe(true);

      course = await call('create_course', {
        fullname: courseName,
        shortname: courseShortname,
        category_id: courseCategory.category_id,
        visible: 1,
        summary: `<p>${courseSummary}</p>`,
        summary_format: 'html',
        course_format: 'topics',
        start_date: courseStart,
        end_date: courseEnd
      });
      expect(course.category_id).toBe(courseCategory.category_id);
      expect(course.summary).toContain(courseSummary);
      expect(course.summary_format).toBe('html');
      expect(course.format).toBe('topics');
      expect(course.start_date).toBe(courseStart);
      expect(course.end_date).toBe(courseEnd);

      const courseDetails = await call('get_course_details', {
        course_id: course.course_id
      });
      expect(courseDetails.course_id).toBe(course.course_id);
      expect(courseDetails.summary).toContain(courseSummary);
      expect(courseDetails.summary_format).toBe('html');
      expect(courseDetails.format).toBe('topics');
      expect(courseDetails.start_date).toBe(courseStart);
      expect(courseDetails.end_date).toBe(courseEnd);

      const createdCalendarEvent = await call('create_calendar_event', {
        course_id: course.course_id,
        name: calendarEventName,
        timestart: calendarEventStart,
        description: calendarEventDescription,
        timeduration: 1800
      });

      calendarEvent = await call('update_calendar_event', {
        course_id: course.course_id,
        event_id: createdCalendarEvent.event_id,
        name: updatedCalendarEventName,
        description: updatedCalendarEventDescription,
        timestart: updatedCalendarEventStart,
        timeduration: 2700
      });

      const listedCalendarEvents = await call('get_calendar_events', {
        course_id: course.course_id,
        time_from: updatedCalendarEventStart - 3600,
        time_to: updatedCalendarEventStart + 7200
      });
      expect(
        listedCalendarEvents.events.some((event) =>
          event.event_id === calendarEvent.event_id &&
          event.name === updatedCalendarEventName
        )
      ).toBe(true);

      const currentUser = await call('get_current_user');
      const enrolledUser = await call('enrol_user', {
        course_id: course.course_id,
        user_id: currentUser.id,
        role_archetype: 'student'
      });

      const enrolledUsers = await call('get_enrolled_users', {
        course_id: course.course_id
      });

      const group = await call('create_group', {
        course_id: course.course_id,
        name: groupName,
        description: `<p>${groupDescription}</p>`
      });

      const addedGroupMember = await call('add_group_member', {
        course_id: course.course_id,
        group_id: group.group_id,
        user_id: currentUser.id
      });

      const listedGroups = await call('get_groups', {
        course_id: course.course_id
      });

      const listedGroupMembers = await call('get_group_members', {
        course_id: course.course_id,
        group_id: group.group_id
      });

      const section = await call('create_section', {
        course_id: course.course_id,
        name: sectionName,
        summary: sectionSummary
      });
      expect(section.visible).toBe(true);
      expect(section.summary).toContain(sectionSummary);

      const hiddenSection = await call('update_section', {
        course_id: course.course_id,
        section_id: section.section_id,
        visible: false
      });
      expect(hiddenSection.visible).toBe(false);

      const visibleSection = await call('update_section', {
        course_id: course.course_id,
        section_id: section.section_id,
        visible: true
      });
      expect(visibleSection.visible).toBe(true);

      const subsectionModule = await call('create_module', {
        course_id: course.course_id,
        section_number: section.section_number,
        module_type: 'subsection',
        name: subsectionName,
        options: JSON.stringify({
          visible: true,
          visible_on_course_page: true
        })
      });
      const subsectionDetails = await call('get_module_details', {
        course_id: course.course_id,
        module_id: subsectionModule.course_module_id
      });
      expect(JSON.parse(subsectionDetails.extra_json).activity.subsection_id).toBe(subsectionModule.instance_id);

      const pageModule = await call('create_module', {
        course_id: course.course_id,
        section_number: section.section_number,
        module_type: 'page',
        name: pageName,
        options: JSON.stringify({
          content: `<h3>${pageHeading}</h3><ul><li>${pageListItem}</li></ul>`
        })
      });

      const hiddenPageModule = await call('update_module', {
        course_id: course.course_id,
        module_id: pageModule.course_module_id,
        visible: false
      });
      expect(hiddenPageModule.visible).toBe(false);

      const visiblePageModule = await call('update_module', {
        course_id: course.course_id,
        module_id: pageModule.course_module_id,
        visible: true
      });
      expect(visiblePageModule.visible).toBe(true);

      const stealthPageModule = await call('create_module', {
        course_id: course.course_id,
        section_number: section.section_number,
        module_type: 'page',
        name: stealthPageName,
        options: JSON.stringify({
          content: `<h3>${stealthPageHeading}</h3>`,
          visible: true,
          visible_on_course_page: false
        })
      });
      expect(stealthPageModule.visible).toBe(true);
      expect(typeof stealthPageModule.visible_on_course_page).toBe('boolean');

      const assignModule = await call('create_module', {
        course_id: course.course_id,
        section_number: section.section_number,
        module_type: 'assign',
        name: assignName,
        options: JSON.stringify({
          intro: `<p>${assignIntro}</p>`,
          online_text: true,
          file_submissions: false
        })
      });

      const savedAssignmentSubmission = await call('save_assignment_submission', {
        course_id: course.course_id,
        module_id: assignModule.course_module_id,
        online_text: `<p>${assignmentSubmissionText}</p>`
      });
      expect(savedAssignmentSubmission.online_text).toContain(assignmentSubmissionText);
      expect(savedAssignmentSubmission.submitted).toBe(false);

      const submittedAssignment = await call('submit_assignment_for_grading', {
        course_id: course.course_id,
        module_id: assignModule.course_module_id,
        accept_submission_statement: 1
      });
      expect(submittedAssignment.submitted).toBe(true);
      expect(submittedAssignment.status).toBe('submitted');
      expect(submittedAssignment.online_text).toContain(assignmentSubmissionText);

      const gradedAssignment = await call('save_assignment_grade', {
        course_id: course.course_id,
        module_id: assignModule.course_module_id,
        user_id: currentUser.id,
        grade: assignmentGrade,
        feedback_comment: `<p>${assignmentFeedbackComment}</p>`
      });
      expect(gradedAssignment.graded).toBe(true);
      expect(gradedAssignment.grade).toBe(assignmentGrade);
      expect(gradedAssignment.grader_id).toBe(currentUser.id);
      expect(gradedAssignment.feedback_comment).toContain(assignmentFeedbackComment);

      const gradeItems = await call('get_grade_items', {
        course_id: course.course_id
      });
      expect(gradeItems.items.some((item) => item.name === assignName)).toBe(true);

      const userGrades = await call('get_user_grades', {
        course_id: course.course_id,
        user_id: currentUser.id
      });
      const assignmentGradeItem = userGrades.items.find((item) => item.course_module_id === assignModule.course_module_id);
      expect(userGrades.user_id).toBe(currentUser.id);
      expect(assignmentGradeItem?.name).toBe(assignName);
      expect(assignmentGradeItem?.grade_raw).toBe(assignmentGrade);

      const bookModule = await call('create_module', {
        course_id: course.course_id,
        section_number: section.section_number,
        module_type: 'book',
        name: bookName,
        options: JSON.stringify({
          intro: `<p>${bookIntro}</p>`,
          numbering: 'numbers',
          custom_titles: false
        })
      });
      const courseBooks = await call('get_course_books', {
        course_id: course.course_id
      });
      expect(courseBooks.books.some((book) => book.module_id === bookModule.course_module_id)).toBe(true);
      const bookChapters = await call('get_book_chapters', {
        course_id: course.course_id,
        module_id: bookModule.course_module_id
      });
      const viewedBook = await call('view_book', {
        course_id: course.course_id,
        module_id: bookModule.course_module_id
      });
      expect(viewedBook.viewed).toBe(true);

      const labelModule = await call('create_module', {
        course_id: course.course_id,
        section_number: section.section_number,
        module_type: 'label',
        name: labelName,
        options: JSON.stringify({
          content: `<div><strong>${labelHeading}</strong><ul><li>${labelListItem}</li></ul></div>`
        })
      });

      const urlModule = await call('create_module', {
        course_id: course.course_id,
        section_number: section.section_number,
        module_type: 'url',
        name: urlName,
        options: JSON.stringify({
          external_url: urlExternalUrl,
          display: 'embed',
          intro: `<p>${urlIntro}</p>`
        })
      });

      const ltiModule = await call('create_module', {
        course_id: course.course_id,
        section_number: section.section_number,
        module_type: 'lti',
        name: ltiName,
        options: JSON.stringify({
          intro: `<p>${ltiIntro}</p>`,
          tool_url: ltiToolUrl,
          launch_container: 'embed_no_blocks',
          send_name: false,
          send_email: false,
          allow_roster: false,
          allow_setting: false,
          accept_grades: false,
          custom_parameters: `browser_suffix=${suffix}`,
          show_title_launch: true
        })
      });
      const ltiDetails = await call('get_module_details', {
        course_id: course.course_id,
        module_id: ltiModule.course_module_id
      });
      expect(JSON.parse(ltiDetails.extra_json).activity.tool_url).toBe(ltiToolUrl);

      const choiceModule = await call('create_module', {
        course_id: course.course_id,
        section_number: section.section_number,
        module_type: 'choice',
        name: choiceName,
        options: JSON.stringify({
          intro: `<p>${choiceIntro}</p>`,
          choices: [choiceOptionOne, choiceOptionTwo, choiceOptionThree]
        })
      });

      const choiceOptions = await call('get_choice_options', {
        course_id: course.course_id,
        choice_module_id: choiceModule.course_module_id
      });
      expect(choiceOptions.options.map((option) => option.text)).toEqual(
        expect.arrayContaining([choiceOptionOne, choiceOptionTwo, choiceOptionThree])
      );
      const selectedChoiceOption = choiceOptions.options.find((option) => option.text === choiceOptionTwo);
      expect(selectedChoiceOption?.option_id).toBeGreaterThan(0);

      const submittedChoiceResponse = await call('submit_choice_response', {
        course_id: course.course_id,
        choice_module_id: choiceModule.course_module_id,
        option_ids: JSON.stringify([selectedChoiceOption.option_id])
      });
      expect(submittedChoiceResponse.submitted).toBe(true);

      const choiceResults = await call('get_choice_results', {
        course_id: course.course_id,
        choice_module_id: choiceModule.course_module_id
      });
      expect(
        choiceResults.results.some((result) =>
          result.text === choiceOptionTwo &&
          result.answer_count >= 1
        )
      ).toBe(true);

      const dataModule = await call('create_module', {
        course_id: course.course_id,
        section_number: section.section_number,
        module_type: 'data',
        name: dataName,
        options: JSON.stringify({
          intro: `<p>${dataIntro}</p>`,
          approval_required: false,
          manage_approved: false,
          required_entries: 0,
          required_entries_to_view: 0,
          max_entries: 0,
          edit_any: true
        })
      });
      const dataTitleField = await call('create_data_field', {
        course_id: course.course_id,
        module_id: dataModule.course_module_id,
        field_type: 'text',
        name: dataTitleFieldName,
        description: 'Browser title field.',
        required: 1
      });
      const dataStatusField = await call('create_data_field', {
        course_id: course.course_id,
        module_id: dataModule.course_module_id,
        field_type: 'menu',
        name: dataStatusFieldName,
        description: 'Browser status field.',
        options: JSON.stringify({
          choices: ['Draft', 'Ready', 'Archived']
        })
      });
      const dataNotesField = await call('create_data_field', {
        course_id: course.course_id,
        module_id: dataModule.course_module_id,
        field_type: 'textarea',
        name: dataNotesFieldName,
        description: 'Browser notes field.',
        options: JSON.stringify({
          rows: 4,
          columns: 60
        })
      });
      const dataEntry = await call('create_data_entry', {
        course_id: course.course_id,
        module_id: dataModule.course_module_id,
        values: JSON.stringify({
          [dataTitleFieldName]: dataEntryTitle,
          [dataStatusFieldName]: 'Draft',
          [dataNotesFieldName]: dataEntryNotes
        })
      });
      const updatedDataEntry = await call('update_data_entry', {
        course_id: course.course_id,
        module_id: dataModule.course_module_id,
        entry_id: dataEntry.entry_id,
        values: JSON.stringify({
          [dataTitleFieldName]: updatedDataEntryTitle,
          [dataStatusFieldName]: 'Ready',
          [dataNotesFieldName]: updatedDataEntryNotes
        })
      });
      const listedDataFields = await call('get_data_fields', {
        course_id: course.course_id,
        module_id: dataModule.course_module_id
      });
      expect(listedDataFields.fields.map((field) => field.name)).toEqual(
        expect.arrayContaining([dataTitleFieldName, dataStatusFieldName, dataNotesFieldName])
      );
      const listedDataEntries = await call('get_data_entries', {
        course_id: course.course_id,
        module_id: dataModule.course_module_id,
        include_contents: 1
      });
      expect(listedDataEntries.entries.some((entry) => entry.entry_id === updatedDataEntry.entry_id)).toBe(true);

      const lessonModule = await call('create_module', {
        course_id: course.course_id,
        section_number: section.section_number,
        module_type: 'lesson',
        name: lessonName,
        options: JSON.stringify({
          intro: `<p>${lessonIntro}</p>`,
          allow_review: true,
          ongoing_score: true,
          progress_bar: true,
          display_left_menu: true,
          max_answers: 4,
          max_attempts: 5,
          grade: 100
        })
      });
      const lessonAccessInformation = await call('get_lesson_access_information', {
        course_id: course.course_id,
        module_id: lessonModule.course_module_id
      });
      const lessonPages = await call('get_lesson_pages', {
        course_id: course.course_id,
        module_id: lessonModule.course_module_id
      });
      const viewedLesson = await call('view_lesson', {
        course_id: course.course_id,
        module_id: lessonModule.course_module_id
      });
      expect(viewedLesson.viewed).toBe(true);
      const lessonUserGrade = await call('get_lesson_user_grade', {
        course_id: course.course_id,
        module_id: lessonModule.course_module_id
      });
      const lessonUserTimers = await call('get_lesson_user_timers', {
        course_id: course.course_id,
        module_id: lessonModule.course_module_id
      });
      const lessonAttemptsOverview = await call('get_lesson_attempts_overview', {
        course_id: course.course_id,
        module_id: lessonModule.course_module_id
      });

      const workshopModule = await call('create_module', {
        course_id: course.course_id,
        section_number: section.section_number,
        module_type: 'workshop',
        name: workshopName,
        options: JSON.stringify({
          intro: `<p>${workshopIntro}</p>`,
          strategy: 'accumulative',
          submission_grade: 80,
          assessment_grade: 20,
          submission_instructions: '<p>Submit a browser-visible workshop sample.</p>',
          assessment_instructions: '<p>Review the browser-visible workshop sample.</p>',
          text_submission: 'required',
          file_submission: 'available',
          max_submission_attachments: 1,
          late_submissions: true,
          self_assessment: true,
          submission_start: Math.floor(Date.now() / 1000) - 60,
          submission_end: Math.floor(Date.now() / 1000) + 3600,
          assessment_start: Math.floor(Date.now() / 1000) + 7200,
          assessment_end: Math.floor(Date.now() / 1000) + 10800,
          conclusion: '<p>Browser workshop conclusion.</p>'
        })
      });
      const workshopSubmissionPhase = await call('set_workshop_phase', {
        course_id: course.course_id,
        module_id: workshopModule.course_module_id,
        phase: 'submission'
      });
      expect(workshopSubmissionPhase.phase).toBe('submission');
      const workshopUserPlan = await call('get_workshop_user_plan', {
        course_id: course.course_id,
        module_id: workshopModule.course_module_id
      });
      const workshopGrades = await call('get_workshop_grades', {
        course_id: course.course_id,
        module_id: workshopModule.course_module_id
      });
      const workshopSubmission = await call('create_workshop_submission', {
        course_id: course.course_id,
        module_id: workshopModule.course_module_id,
        title: workshopSubmissionTitle,
        content: `<p>${workshopSubmissionContent}</p>`,
        content_format: 'html'
      });
      const updatedWorkshopSubmission = await call('update_workshop_submission', {
        course_id: course.course_id,
        module_id: workshopModule.course_module_id,
        submission_id: workshopSubmission.submission_id,
        title: updatedWorkshopSubmissionTitle,
        content: `<p>${updatedWorkshopSubmissionContent}</p>`,
        content_format: 'html'
      });
      const listedWorkshopSubmissions = await call('get_workshop_submissions', {
        course_id: course.course_id,
        module_id: workshopModule.course_module_id
      });
      expect(listedWorkshopSubmissions.submissions.some((submission) =>
        submission.submission_id === updatedWorkshopSubmission.submission_id &&
        submission.title === updatedWorkshopSubmissionTitle
      )).toBe(true);
      const workshopGradesReport = await call('get_workshop_grades_report', {
        course_id: course.course_id,
        module_id: workshopModule.course_module_id,
        sort_by: 'submissiontitle',
        sort_direction: 'ASC',
        page: 0,
        per_page: 20
      });
      const workshopAssessmentPhase = await call('set_workshop_phase', {
        course_id: course.course_id,
        module_id: workshopModule.course_module_id,
        phase: 'assessment'
      });
      expect(workshopAssessmentPhase.phase).toBe('assessment');
      const workshopReviewerAssessments = await call('get_workshop_reviewer_assessments', {
        course_id: course.course_id,
        module_id: workshopModule.course_module_id,
        user_id: workshopUserPlan.user_id
      });
      const workshopSubmissionAssessments = await call('get_workshop_submission_assessments', {
        course_id: course.course_id,
        module_id: workshopModule.course_module_id,
        submission_id: updatedWorkshopSubmission.submission_id
      });

      const forumModule = await call('create_module', {
        course_id: course.course_id,
        section_number: section.section_number,
        module_type: 'forum',
        name: forumName,
        options: JSON.stringify({
          forum_type: 'general',
          intro: `<p>${forumIntro}</p>`
        })
      });

      const forumDiscussion = await call('create_forum_discussion', {
        course_id: course.course_id,
        module_id: forumModule.course_module_id,
        name: forumDiscussionName,
        message: `<p>${forumDiscussionMessage}</p>`
      });

      const listedForumDiscussions = await call('get_forum_discussions', {
        course_id: course.course_id,
        module_id: forumModule.course_module_id
      });
      expect(
        listedForumDiscussions.discussions.some((discussion) =>
          discussion.discussion_id === forumDiscussion.discussion_id &&
          discussion.name === forumDiscussionName
        )
      ).toBe(true);

      const initialForumPosts = await call('get_forum_discussion_posts', {
        course_id: course.course_id,
        module_id: forumModule.course_module_id,
        discussion_id: forumDiscussion.discussion_id
      });
      expect(
        initialForumPosts.posts.some((post) =>
          post.post_id === forumDiscussion.first_post_id &&
          post.subject === forumDiscussionName
        )
      ).toBe(true);

      const forumReply = await call('create_forum_discussion_post', {
        course_id: course.course_id,
        module_id: forumModule.course_module_id,
        discussion_id: forumDiscussion.discussion_id,
        parent_post_id: forumDiscussion.first_post_id,
        subject: forumReplySubject,
        message: `<p>${forumReplyMessage}</p>`
      });

      const updatedForumReply = await call('update_forum_discussion_post', {
        course_id: course.course_id,
        module_id: forumModule.course_module_id,
        discussion_id: forumDiscussion.discussion_id,
        post_id: forumReply.post_id,
        subject: updatedForumReplySubject,
        message: `<p>${updatedForumReplyMessage}</p>`
      });

      const listedForumPosts = await call('get_forum_discussion_posts', {
        course_id: course.course_id,
        module_id: forumModule.course_module_id,
        discussion_id: forumDiscussion.discussion_id
      });
      expect(
        listedForumPosts.posts.some((post) =>
          post.post_id === updatedForumReply.post_id &&
          post.subject === updatedForumReplySubject
        )
      ).toBe(true);

      const glossaryModule = await call('create_module', {
        course_id: course.course_id,
        section_number: section.section_number,
        module_type: 'glossary',
        name: glossaryName,
        options: JSON.stringify({
          intro: `<p>${glossaryIntro}</p>`,
          display_format: 'dictionary',
          default_approval: true,
          allow_comments: true
        })
      });

      const glossaryEntry = await call('create_glossary_entry', {
        course_id: course.course_id,
        module_id: glossaryModule.course_module_id,
        concept: glossaryConcept,
        definition: `<p>${glossaryDefinition}</p>`,
        definition_format: 'html',
        options: JSON.stringify({
          aliases: ['MoodlIA browser glossary alias'],
          usedynalink: true
        })
      });

      const searchedGlossaryEntries = await call('search_glossary_entries', {
        course_id: course.course_id,
        module_id: glossaryModule.course_module_id,
        query: glossaryConcept,
        full_search: 1,
        include_not_approved: 1
      });
      expect(
        searchedGlossaryEntries.entries.some((entry) => entry.entry_id === glossaryEntry.entry_id)
      ).toBe(true);

      const updatedGlossaryEntry = await call('update_glossary_entry', {
        course_id: course.course_id,
        module_id: glossaryModule.course_module_id,
        entry_id: glossaryEntry.entry_id,
        concept: updatedGlossaryConcept,
        definition: `<p>${updatedGlossaryDefinition}</p>`,
        definition_format: 'html',
        options: JSON.stringify({
          aliases: ['MoodlIA browser updated glossary alias'],
          usedynalink: true
        })
      });
      expect(updatedGlossaryEntry.entry_id).toBe(glossaryEntry.entry_id);

      const searchedUpdatedGlossaryEntries = await call('search_glossary_entries', {
        course_id: course.course_id,
        module_id: glossaryModule.course_module_id,
        query: updatedGlossaryConcept,
        full_search: 1,
        include_not_approved: 1
      });
      expect(
        searchedUpdatedGlossaryEntries.entries.some((entry) =>
          entry.entry_id === glossaryEntry.entry_id &&
          entry.concept === updatedGlossaryConcept
        )
      ).toBe(true);

      const wikiModule = await call('create_module', {
        course_id: course.course_id,
        section_number: section.section_number,
        module_type: 'wiki',
        name: wikiName,
        options: JSON.stringify({
          intro: `<p>${wikiIntro}</p>`,
          first_page_title: wikiFirstPage,
          wiki_mode: 'collaborative',
          default_format: 'html'
        })
      });

      const wikiPage = await call('create_wiki_page', {
        course_id: course.course_id,
        module_id: wikiModule.course_module_id,
        title: wikiPageTitle,
        content: `<h3>${wikiPageTitle}</h3><p>${wikiPageContent}</p>`,
        content_format: 'html'
      });
      expect(wikiPage.title).toBe(wikiPageTitle);

      const listedWikiPages = await call('get_wiki_pages', {
        course_id: course.course_id,
        module_id: wikiModule.course_module_id,
        sort_by: 'title',
        sort_direction: 'ASC',
        include_content: 1
      });
      expect(
        listedWikiPages.pages.some((page) => page.page_id === wikiPage.page_id)
      ).toBe(true);

      const updatedWikiPage = await call('update_wiki_page', {
        course_id: course.course_id,
        module_id: wikiModule.course_module_id,
        page_id: wikiPage.page_id,
        content: `<h3>${wikiPageTitle}</h3><p>${updatedWikiPageContent}</p>`
      });
      expect(updatedWikiPage.content).toContain(updatedWikiPageContent);

      const listedUpdatedWikiPages = await call('get_wiki_pages', {
        course_id: course.course_id,
        module_id: wikiModule.course_module_id,
        sort_by: 'title',
        sort_direction: 'ASC',
        include_content: 1
      });
      expect(
        listedUpdatedWikiPages.pages.some((page) =>
          page.page_id === wikiPage.page_id &&
          page.content.includes(updatedWikiPageContent)
        )
      ).toBe(true);

      const folderModule = await call('create_module', {
        course_id: course.course_id,
        section_number: section.section_number,
        module_type: 'folder',
        name: folderName,
        options: '{}'
      });

      const uploadedFile = await call('upload_folder_file', {
        course_id: course.course_id,
        module_id: folderModule.course_module_id,
        filename,
        upload_reference: Buffer.from(fileContent, 'utf8').toString('base64')
      });

      const resourceModule = await call('create_module', {
        course_id: course.course_id,
        section_number: section.section_number,
        module_type: 'resource',
        name: resourceName,
        options: JSON.stringify({
          intro: `<p>${resourceIntro}</p>`,
          filename: resourceFilename,
          upload_reference: Buffer.from(resourceFileContent, 'utf8').toString('base64'),
          display: 'embed',
          print_intro: true
        })
      });

      const resourceFiles = await call('get_resource_files', {
        course_id: course.course_id,
        module_id: resourceModule.course_module_id
      });
      expect(
        resourceFiles.files.some((file) =>
          file.filename === resourceFilename &&
          file.filesize === Buffer.byteLength(resourceFileContent, 'utf8')
        )
      ).toBe(true);
      const resourceFile = resourceFiles.files.find((file) => file.filename === resourceFilename);
      const downloadedResourceFile = await call('download_resource_file', {
        course_id: course.course_id,
        module_id: resourceModule.course_module_id,
        file_id: resourceFile.file_id
      });
      expect(downloadedResourceFile.filename).toBe(resourceFilename);

      const qbankModule = await call('create_module', {
        course_id: course.course_id,
        section_number: 0,
        module_type: 'qbank',
        name: qbankName,
        options: JSON.stringify({
          intro: `<p>MoodlIA browser shared question bank ${suffix}</p>`,
          visible: true
        })
      });

      const quizModule = await call('create_module', {
        course_id: course.course_id,
        section_number: section.section_number,
        module_type: 'quiz',
        name: quizName,
        options: JSON.stringify({
          intro: `<p>MoodlIA browser quiz intro ${suffix}</p>`
        })
      });

      const sharedCategory = await call('create_question_category', {
        course_id: course.course_id,
        name: sharedCategoryName,
        question_bank_module_id: qbankModule.course_module_id
      });

      const trueFalseQuestion = await call('create_question', {
        category_id: sharedCategory.category_id,
        context_id: sharedCategory.context_id,
        question_type: 'truefalse',
        name: trueFalseQuestionName,
        question_text: `<p>${trueFalseQuestionText}</p>`,
        options: JSON.stringify({
          correct_answer: true,
          feedback_true: 'Correct.',
          feedback_false: 'Incorrect.'
        })
      });

      const moveTargetCategory = await call('create_question_category', {
        course_id: course.course_id,
        name: moveTargetCategoryName,
        question_bank_module_id: sharedCategory.question_bank_module_id
      });

      const movableQuestion = await call('create_question', {
        category_id: sharedCategory.category_id,
        context_id: sharedCategory.context_id,
        question_type: 'truefalse',
        name: movableQuestionName,
        question_text: `<p>This browser verification question is moved between question categories ${suffix}.</p>`,
        options: JSON.stringify({
          correct_answer: true
        })
      });

      const movedQuestion = await call('move_question', {
        course_id: course.course_id,
        question_id: movableQuestion.question_id,
        target_category_id: moveTargetCategory.category_id,
        target_question_bank_module_id: sharedCategory.question_bank_module_id
      });
      expect(movedQuestion.moved).toBe(true);
      expect(movedQuestion.target_category_id).toBe(moveTargetCategory.category_id);

      const randomPoolQuestion = await call('create_question', {
        category_id: sharedCategory.category_id,
        context_id: sharedCategory.context_id,
        question_type: 'truefalse',
        name: randomPoolQuestionName,
        question_text: `<p>${randomPoolQuestionText}</p>`,
        options: JSON.stringify({
          correct_answer: true
        })
      });

      const privateCategory = await call('create_question_category', {
        course_id: course.course_id,
        name: privateCategoryName,
        bank_scope: 'quiz_private',
        quiz_module_id: quizModule.course_module_id
      });

      const shortAnswerQuestion = await call('create_question', {
        category_id: privateCategory.category_id,
        context_id: privateCategory.context_id,
        question_type: 'shortanswer',
        name: shortAnswerQuestionName,
        question_text: `<p>${shortAnswerQuestionText}</p>`,
        options: JSON.stringify({
          answers: [
            {
              text: 'MoodlIA',
              fraction: 1,
              feedback: 'Correct.'
            }
          ],
          case_sensitive: false
        })
      });

      const multichoiceQuestion = await call('create_question', {
        category_id: sharedCategory.category_id,
        context_id: sharedCategory.context_id,
        question_type: 'multichoice',
        name: multichoiceQuestionName,
        question_text: `<p>${multichoiceQuestionText}</p>`,
        options: JSON.stringify({
          single: true,
          shuffle_answers: false,
          answer_numbering: 'abc',
          answers: [
            {
              text: multichoiceCorrectAnswer,
              fraction: 1,
              feedback: 'Correct.'
            },
            {
              text: multichoiceDistractorOne,
              fraction: 0,
              feedback: 'Incorrect.'
            },
            {
              text: multichoiceDistractorTwo,
              fraction: 0,
              feedback: 'Incorrect.'
            }
          ],
          correct_feedback: 'Correct browser choice.',
          incorrect_feedback: 'Incorrect browser choice.'
        })
      });

      const numericalQuestion = await call('create_question', {
        category_id: sharedCategory.category_id,
        context_id: sharedCategory.context_id,
        question_type: 'numerical',
        name: numericalQuestionName,
        question_text: `<p>${numericalQuestionText}</p>`,
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

      const matchingQuestion = await call('create_question', {
        category_id: sharedCategory.category_id,
        context_id: sharedCategory.context_id,
        question_type: 'matching',
        name: matchingQuestionName,
        question_text: `<p>${matchingQuestionText}</p>`,
        options: JSON.stringify({
          shuffle_answers: false,
          subquestions: [
            {
              question: matchingStemOne,
              answer: matchingAnswerOne
            },
            {
              question: matchingStemTwo,
              answer: matchingAnswerTwo
            },
            {
              question: matchingStemThree,
              answer: matchingAnswerThree
            }
          ],
          correct_feedback: 'Correct browser matching pairs.',
          incorrect_feedback: 'Incorrect browser matching pairs.'
        })
      });

      const essayQuestion = await call('create_question', {
        category_id: sharedCategory.category_id,
        context_id: sharedCategory.context_id,
        question_type: 'essay',
        name: essayQuestionName,
        question_text: `<p>${essayQuestionText}</p>`,
        options: JSON.stringify({
          response_format: 'plain',
          response_required: true,
          response_field_lines: 10,
          response_template: essayResponseTemplate,
          grader_info: '<p>Verify browser-visible essay prompt and response field.</p>'
        })
      });

      const trueFalseSlot = await call('add_question_to_quiz', {
        quiz_module_id: quizModule.course_module_id,
        question_id: trueFalseQuestion.question_id
      });

      const updatedTrueFalseSlot = await call('update_quiz_question_slot', {
        quiz_module_id: quizModule.course_module_id,
        slot: trueFalseSlot.slot,
        max_mark: 2.5
      });
      expect(updatedTrueFalseSlot.updated).toBe(true);
      expect(updatedTrueFalseSlot.maxmark).toBe(2.5);

      const removableQuizQuestion = await call('create_question', {
        category_id: privateCategory.category_id,
        context_id: privateCategory.context_id,
        question_type: 'truefalse',
        name: removableQuizQuestionName,
        question_text: `<p>This browser verification question is removed from the quiz ${suffix}.</p>`,
        options: JSON.stringify({
          correct_answer: true
        })
      });

      const removableQuizSlot = await call('add_question_to_quiz', {
        quiz_module_id: quizModule.course_module_id,
        question_id: removableQuizQuestion.question_id
      });

      const removedQuizQuestion = await call('remove_question_from_quiz', {
        quiz_module_id: quizModule.course_module_id,
        slot: removableQuizSlot.slot
      });
      expect(removedQuizQuestion.removed).toBe(true);
      expect(removedQuizQuestion.question_id).toBe(removableQuizQuestion.question_id);

      const shortAnswerSlot = await call('add_question_to_quiz', {
        quiz_module_id: quizModule.course_module_id,
        question_id: shortAnswerQuestion.question_id
      });

      const multichoiceSlot = await call('add_question_to_quiz', {
        quiz_module_id: quizModule.course_module_id,
        question_id: multichoiceQuestion.question_id
      });

      const numericalSlot = await call('add_question_to_quiz', {
        quiz_module_id: quizModule.course_module_id,
        question_id: numericalQuestion.question_id
      });

      const matchingSlot = await call('add_question_to_quiz', {
        quiz_module_id: quizModule.course_module_id,
        question_id: matchingQuestion.question_id
      });

      const essaySlot = await call('add_question_to_quiz', {
        quiz_module_id: quizModule.course_module_id,
        question_id: essayQuestion.question_id
      });

      const randomQuizQuestions = await call('add_random_questions_to_quiz', {
        quiz_module_id: quizModule.course_module_id,
        category_id: sharedCategory.category_id,
        number: 1,
        question_bank_module_id: sharedCategory.question_bank_module_id
      });
      expect(randomQuizQuestions.added_count).toBe(1);
      expect(randomQuizQuestions.slots[0].question_type).toBe('random');

      const listedQuizQuestions = await call('get_quiz_questions', {
        quiz_module_id: quizModule.course_module_id
      });
      expect(listedQuizQuestions.questions.map((question) => question.question_id)).toEqual(
        expect.arrayContaining([
          trueFalseQuestion.question_id,
          shortAnswerQuestion.question_id,
          multichoiceQuestion.question_id,
          numericalQuestion.question_id,
          matchingQuestion.question_id,
          essayQuestion.question_id
        ])
      );
      expect(
        listedQuizQuestions.questions.some((question) => question.question_id === removableQuizQuestion.question_id)
      ).toBe(false);

      const startedQuizAttempt = await call('start_quiz_attempt', {
        quiz_module_id: quizModule.course_module_id
      });
      expect(startedQuizAttempt.attempt.attempt_id).toBeGreaterThan(0);
      expect(startedQuizAttempt.attempt.state).toBe('inprogress');

      const listedQuizAttempts = await call('get_quiz_attempts', {
        quiz_module_id: quizModule.course_module_id,
        user_id: currentUser.id,
        status: 'all',
        include_previews: 1
      });
      expect(
        listedQuizAttempts.attempts.some((attempt) => attempt.attempt_id === startedQuizAttempt.attempt.attempt_id)
      ).toBe(true);

      fixture = {
        courseCategory,
        courseCategoryName: updatedCourseCategoryName,
        course,
        courseDetails,
        courseSummary,
        calendarEvent,
        calendarEventName: updatedCalendarEventName,
        calendarEventDescription: updatedCalendarEventDescription,
        calendarEventStart: updatedCalendarEventStart,
        listedCalendarEvents,
        currentUser,
        enrolledUser,
        enrolledUsers,
        group,
        groupName,
        groupDescription,
        addedGroupMember,
        listedGroups,
        listedGroupMembers,
        section,
        sectionName,
        sectionSummary,
        subsectionModule,
        subsectionName,
        subsectionDetails,
        pageModule,
        hiddenPageModule,
        visiblePageModule,
        pageName,
        pageHeading,
        pageListItem,
        stealthPageModule,
        stealthPageName,
        stealthPageHeading,
        assignModule,
        assignName,
        assignIntro,
        assignmentSubmissionText,
        assignmentGrade,
        assignmentFeedbackComment,
        savedAssignmentSubmission,
        submittedAssignment,
        gradedAssignment,
        gradeItems,
        userGrades,
        bookModule,
        bookName,
        bookIntro,
        courseBooks,
        bookChapters,
        viewedBook,
        labelModule,
        labelName,
        labelHeading,
        labelListItem,
        urlModule,
        urlName,
        urlIntro,
        urlExternalUrl,
        ltiModule,
        ltiName,
        ltiIntro,
        ltiToolUrl,
        ltiDetails,
        choiceModule,
        choiceName,
        choiceIntro,
        choiceOptionOne,
        choiceOptionTwo,
        choiceOptionThree,
        choiceOptions,
        submittedChoiceResponse,
        choiceResults,
        dataModule,
        dataName,
        dataIntro,
        dataTitleField,
        dataTitleFieldName,
        dataStatusField,
        dataStatusFieldName,
        dataNotesField,
        dataNotesFieldName,
        dataEntry,
        dataEntryTitle,
        updatedDataEntry,
        updatedDataEntryTitle,
        dataEntryNotes,
        updatedDataEntryNotes,
        listedDataFields,
        listedDataEntries,
        lessonModule,
        lessonName,
        lessonIntro,
        lessonAccessInformation,
        lessonPages,
        viewedLesson,
        lessonUserGrade,
        lessonUserTimers,
        lessonAttemptsOverview,
        workshopModule,
        workshopName,
        workshopIntro,
        workshopSubmissionPhase,
        workshopUserPlan,
        workshopGrades,
        workshopSubmission,
        workshopSubmissionTitle,
        workshopSubmissionContent,
        updatedWorkshopSubmission,
        updatedWorkshopSubmissionTitle,
        updatedWorkshopSubmissionContent,
        listedWorkshopSubmissions,
        workshopGradesReport,
        workshopAssessmentPhase,
        workshopReviewerAssessments,
        workshopSubmissionAssessments,
        forumModule,
        forumName,
        forumIntro,
        forumDiscussion,
        forumDiscussionName,
        forumDiscussionMessage,
        listedForumDiscussions,
        initialForumPosts,
        forumReply,
        forumReplySubject,
        forumReplyMessage,
        updatedForumReply,
        updatedForumReplySubject,
        updatedForumReplyMessage,
        listedForumPosts,
        glossaryModule,
        glossaryName,
        glossaryIntro,
        glossaryEntry,
        glossaryConcept,
        glossaryDefinition,
        updatedGlossaryEntry,
        updatedGlossaryConcept,
        updatedGlossaryDefinition,
        searchedGlossaryEntries,
        searchedUpdatedGlossaryEntries,
        wikiModule,
        wikiName,
        wikiIntro,
        wikiFirstPage,
        wikiPage,
        wikiPageTitle,
        wikiPageContent,
        updatedWikiPage,
        updatedWikiPageContent,
        listedWikiPages,
        listedUpdatedWikiPages,
        folderModule,
        folderName,
        uploadedFile,
        filename,
        resourceModule,
        resourceName,
        resourceIntro,
        resourceFilename,
        resourceFileContent,
        resourceFiles,
        downloadedResourceFile,
        qbankModule,
        qbankName,
        quizModule,
        quizName,
        sharedCategory,
        sharedCategoryName,
        moveTargetCategory,
        moveTargetCategoryName,
        privateCategory,
        privateCategoryName,
        trueFalseQuestion,
        trueFalseQuestionName,
        trueFalseQuestionText,
        movableQuestion,
        movableQuestionName,
        movedQuestion,
        randomPoolQuestion,
        randomPoolQuestionName,
        randomPoolQuestionText,
        trueFalseSlot,
        updatedTrueFalseSlot,
        removableQuizQuestion,
        removableQuizQuestionName,
        removableQuizSlot,
        removedQuizQuestion,
        shortAnswerQuestion,
        shortAnswerQuestionName,
        shortAnswerQuestionText,
        shortAnswerSlot,
        multichoiceQuestion,
        multichoiceQuestionName,
        multichoiceQuestionText,
        multichoiceCorrectAnswer,
        multichoiceDistractorOne,
        multichoiceDistractorTwo,
        multichoiceSlot,
        numericalQuestion,
        numericalQuestionName,
        numericalQuestionText,
        numericalSlot,
        matchingQuestion,
        matchingQuestionName,
        matchingQuestionText,
        matchingStemOne,
        matchingStemTwo,
        matchingStemThree,
        matchingAnswerOne,
        matchingAnswerTwo,
        matchingAnswerThree,
        matchingSlot,
        essayQuestion,
        essayQuestionName,
        essayQuestionText,
        essayResponseTemplate,
        essaySlot,
        randomQuizQuestions,
        listedQuizQuestions,
        startedQuizAttempt,
        listedQuizAttempts
      };
    } catch (error) {
      shouldCleanup = false;
      if (course?.course_id) {
        console.error(`Detailed browser fixture course left in Moodle for inspection: ${course.course_id}`);
      }
      if (calendarEvent?.event_id) {
        console.error(`Detailed browser fixture calendar event left in Moodle for inspection: ${calendarEvent.event_id}`);
      }
      if (courseCategory?.category_id) {
        console.error(`Detailed browser fixture course category left in Moodle for inspection: ${courseCategory.category_id}`);
      }
      throw error;
    }
  });

  test.beforeEach(async ({ page }) => {
    await loginAsConfiguredUser(page);
  });

  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      shouldCleanup = false;
      if (fixture?.course?.course_id) {
        console.error(`Detailed browser fixture course left in Moodle for inspection: ${fixture.course.course_id}`);
      }
    }
  });

  test.afterAll(async () => {
    if (shouldCleanup && fixture?.calendarEvent?.event_id) {
      await call('delete_calendar_event', {
        course_id: fixture.course.course_id,
        event_id: fixture.calendarEvent.event_id
      });
    }
    if (shouldCleanup && fixture?.course?.course_id) {
      await call('delete_course', {
        course_id: fixture.course.course_id
      });
    }
    if (shouldCleanup && fixture?.courseCategory?.category_id) {
      await call('delete_course_category', {
        category_id: fixture.courseCategory.category_id
      });
    }
  });

  test('category page shows generated category and course subelements', async ({ page }) => {
    await page.goto(`/course/index.php?categoryid=${fixture.courseCategory.category_id}`);
    await expectMoodlePageLoaded(page);
    await expect(page).toHaveURL(new RegExp(`/course/index\\.php\\?categoryid=${fixture.courseCategory.category_id}`));

    const body = page.locator('body');
    await expect(body).toContainText(fixture.courseCategoryName);
    await expect(body).toContainText(fixture.course.fullname);
    await expect(body).toContainText(fixture.courseSummary);
    await expect(page.getByRole('link', { name: fixture.course.fullname }).first()).toHaveAttribute(
      'href',
      new RegExp(`/course/view\\.php\\?id=${fixture.course.course_id}`)
    );
  });

  test('calendar day page shows generated course event subelements', async ({ page }) => {
    await page.goto(`/calendar/view.php?view=day&course=${fixture.course.course_id}&time=${fixture.calendarEventStart}`);
    await expectMoodlePageLoaded(page);
    await expect(page).toHaveURL(new RegExp(`/calendar/view\\.php\\?view=day&course=${fixture.course.course_id}&time=${fixture.calendarEventStart}`));

    expect(fixture.listedCalendarEvents.events.some((event) =>
      event.event_id === fixture.calendarEvent.event_id &&
      event.name === fixture.calendarEventName
    )).toBe(true);

    const body = page.locator('body');
    await expect(body).toContainText(fixture.calendarEventName);
    await expect(body).toContainText(fixture.calendarEventDescription);
    await expect(body).toContainText(/calendar|calendario|event|evento/i);
  });

  test('course page shows generated section and activity subelements', async ({ page }) => {
    await page.goto(`/course/view.php?id=${fixture.course.course_id}`);
    await expectMoodlePageLoaded(page);
    await expect(page).toHaveURL(new RegExp(`/course/view\\.php\\?id=${fixture.course.course_id}(?:&|$)`));

    const body = page.locator('body');
    await expect(body).toContainText(fixture.sectionName);
    await expect(body).toContainText(fixture.sectionSummary);
    await expect(body).toContainText(fixture.subsectionName);
    await expect(body).toContainText(fixture.pageName);
    await expect(body).toContainText(fixture.assignName);
    await expect(body).toContainText(fixture.bookName);
    await expect(body).toContainText(fixture.labelHeading);
    await expect(body).toContainText(fixture.labelListItem);
    await expect(body).toContainText(fixture.urlName);
    await expect(body).toContainText(fixture.ltiName);
    await expect(body).toContainText(fixture.choiceName);
    await expect(body).toContainText(fixture.dataName);
    await expect(body).toContainText(fixture.lessonName);
    await expect(body).toContainText(fixture.workshopName);
    await expect(body).toContainText(fixture.forumName);
    await expect(body).toContainText(fixture.glossaryName);
    await expect(body).toContainText(fixture.wikiName);
    await expect(body).toContainText(fixture.folderName);
    await expect(body).toContainText(fixture.resourceName);
    await expect(body).toContainText(fixture.quizName);

    await expect(page.getByRole('link', { name: fixture.pageName }).first()).toHaveAttribute(
      'href',
      new RegExp(`/mod/page/view\\.php\\?id=${fixture.pageModule.course_module_id}`)
    );
    if (!fixture.stealthPageModule.visible_on_course_page) {
      await expect(page.getByRole('link', { name: fixture.stealthPageName })).toHaveCount(0);
    }
    await expect(page.getByRole('link', { name: fixture.assignName }).first()).toHaveAttribute(
      'href',
      new RegExp(`/mod/assign/view\\.php\\?id=${fixture.assignModule.course_module_id}`)
    );
    await expect(page.getByRole('link', { name: fixture.bookName }).first()).toHaveAttribute(
      'href',
      new RegExp(`/mod/book/view\\.php\\?id=${fixture.bookModule.course_module_id}`)
    );
    await expect(page.getByRole('link', { name: fixture.labelName })).toHaveCount(0);
    await expect(page.getByRole('link', { name: fixture.urlName }).first()).toHaveAttribute(
      'href',
      new RegExp(`/mod/url/view\\.php\\?id=${fixture.urlModule.course_module_id}`)
    );
    await expect(page.getByRole('link', { name: fixture.ltiName }).first()).toHaveAttribute(
      'href',
      new RegExp(`/mod/lti/view\\.php\\?id=${fixture.ltiModule.course_module_id}`)
    );
    await expect(page.getByRole('link', { name: fixture.choiceName }).first()).toHaveAttribute(
      'href',
      new RegExp(`/mod/choice/view\\.php\\?id=${fixture.choiceModule.course_module_id}`)
    );
    await expect(page.getByRole('link', { name: fixture.dataName }).first()).toHaveAttribute(
      'href',
      new RegExp(`/mod/data/view\\.php\\?id=${fixture.dataModule.course_module_id}`)
    );
    await expect(page.getByRole('link', { name: fixture.lessonName }).first()).toHaveAttribute(
      'href',
      new RegExp(`/mod/lesson/view\\.php\\?id=${fixture.lessonModule.course_module_id}`)
    );
    await expect(page.getByRole('link', { name: fixture.workshopName }).first()).toHaveAttribute(
      'href',
      new RegExp(`/mod/workshop/view\\.php\\?id=${fixture.workshopModule.course_module_id}`)
    );
    await expect(page.getByRole('link', { name: fixture.forumName }).first()).toHaveAttribute(
      'href',
      new RegExp(`/mod/forum/view\\.php\\?id=${fixture.forumModule.course_module_id}`)
    );
    await expect(page.getByRole('link', { name: fixture.glossaryName }).first()).toHaveAttribute(
      'href',
      new RegExp(`/mod/glossary/view\\.php\\?id=${fixture.glossaryModule.course_module_id}`)
    );
    await expect(page.getByRole('link', { name: fixture.wikiName }).first()).toHaveAttribute(
      'href',
      new RegExp(`/mod/wiki/view\\.php\\?id=${fixture.wikiModule.course_module_id}`)
    );
    await expect(page.getByRole('link', { name: fixture.folderName }).first()).toHaveAttribute(
      'href',
      new RegExp(`/mod/folder/view\\.php\\?id=${fixture.folderModule.course_module_id}`)
    );
    await expect(page.getByRole('link', { name: fixture.resourceName }).first()).toHaveAttribute(
      'href',
      new RegExp(`/mod/resource/view\\.php\\?id=${fixture.resourceModule.course_module_id}`)
    );
    await expect(page.getByRole('link', { name: fixture.quizName }).first()).toHaveAttribute(
      'href',
      new RegExp(`/mod/quiz/view\\.php\\?id=${fixture.quizModule.course_module_id}`)
    );
  });

  test('participants page shows enrolled user and role subelements', async ({ page }) => {
    await page.goto(`/user/index.php?id=${fixture.course.course_id}`);
    await expectMoodlePageLoaded(page);
    await expect(page).toHaveURL(new RegExp(`/user/index\\.php\\?id=${fixture.course.course_id}`));

    expect(fixture.enrolledUser.enrolled).toBe(true);
    expect(fixture.enrolledUser.user_id).toBe(fixture.currentUser.id);
    expect(fixture.enrolledUser.user.roles).toContain('student');
    expect(
      fixture.enrolledUsers.users.some((user) =>
        user.user_id === fixture.currentUser.id &&
        user.username === fixture.currentUser.username &&
        user.roles.includes('student')
      )
    ).toBe(true);
    const body = page.locator('body');
    await expect(body).toContainText(fixture.currentUser.fullname);
    if (fixture.enrolledUser.user.email) {
      await expect(body).toContainText(fixture.enrolledUser.user.email);
    }
    await expect(body).toContainText(/student|estudiante|alumno/i);
    const profileLink = page.locator(
      `a[href*="/user/view.php?id=${fixture.currentUser.id}&course=${fixture.course.course_id}"]`
    ).first();
    await expect(profileLink).toBeVisible();
    await expect(profileLink).toContainText(fixture.currentUser.fullname);
  });

  test('groups page shows generated group and member subelements', async ({ page }) => {
    await page.goto(`/group/index.php?id=${fixture.course.course_id}`);
    await expectMoodlePageLoaded(page);
    await expect(page).toHaveURL(new RegExp(`/group/index\\.php\\?id=${fixture.course.course_id}`));

    expect(fixture.addedGroupMember.added).toBe(true);
    expect(fixture.addedGroupMember.group_id).toBe(fixture.group.group_id);
    expect(fixture.addedGroupMember.user_id).toBe(fixture.currentUser.id);
    expect(
      fixture.listedGroups.groups.some((group) =>
        group.group_id === fixture.group.group_id &&
        group.name === fixture.groupName &&
        group.description.includes(fixture.groupDescription)
      )
    ).toBe(true);
    expect(
      fixture.listedGroupMembers.members.some((member) =>
        member.user_id === fixture.currentUser.id &&
        member.username === fixture.currentUser.username
      )
    ).toBe(true);

    const body = page.locator('body');
    await expect(body).toContainText(fixture.groupName);
    await expect(body).toContainText(fixture.currentUser.fullname);
    await expect(body).toContainText(/groups|grupos/i);
    await expect(body).toContainText(/members|miembros/i);
  });

  test('page activity shows nested page content', async ({ page }) => {
    await page.goto(`/mod/page/view.php?id=${fixture.pageModule.course_module_id}`);
    await expectMoodlePageLoaded(page);

    await expect(page.getByRole('heading', { name: fixture.pageName }).first()).toBeVisible();
    await expect(page.locator('body')).toContainText(fixture.pageHeading);
    await expect(page.locator('body')).toContainText(fixture.pageListItem);
  });

  test('stealth page setting is reported and direct access works', async ({ page }) => {
    expect(fixture.stealthPageModule.visible).toBe(true);
    expect(typeof fixture.stealthPageModule.visible_on_course_page).toBe('boolean');

    await page.goto(`/course/view.php?id=${fixture.course.course_id}`);
    await expectMoodlePageLoaded(page);
    if (!fixture.stealthPageModule.visible_on_course_page) {
      await expect(page.getByRole('link', { name: fixture.stealthPageName })).toHaveCount(0);
    } else {
      await expect(page.getByRole('link', { name: fixture.stealthPageName }).first()).toBeVisible();
    }

    await page.goto(`/mod/page/view.php?id=${fixture.stealthPageModule.course_module_id}`);
    await expectMoodlePageLoaded(page);
    await expect(page.getByRole('heading', { name: fixture.stealthPageName }).first()).toBeVisible();
    await expect(page.locator('body')).toContainText(fixture.stealthPageHeading);
  });

  test('assignment activity shows description and grading summary subelements', async ({ page }) => {
    await page.goto(`/mod/assign/view.php?id=${fixture.assignModule.course_module_id}`);
    await expectMoodlePageLoaded(page);
    await expect(page).toHaveURL(new RegExp(`/mod/assign/view\\.php\\?id=${fixture.assignModule.course_module_id}`));

    expect(fixture.savedAssignmentSubmission.submitted).toBe(false);
    expect(fixture.savedAssignmentSubmission.online_text).toContain(fixture.assignmentSubmissionText);
    expect(fixture.submittedAssignment.submitted).toBe(true);
    expect(fixture.submittedAssignment.status).toBe('submitted');
    expect(fixture.submittedAssignment.online_text).toContain(fixture.assignmentSubmissionText);
    expect(fixture.gradedAssignment.graded).toBe(true);
    expect(fixture.gradedAssignment.grade).toBe(fixture.assignmentGrade);
    expect(fixture.gradedAssignment.feedback_comment).toContain(fixture.assignmentFeedbackComment);

    const body = page.locator('body');
    await expect(page.getByRole('heading', { name: fixture.assignName }).first()).toBeVisible();
    await expect(body).toContainText(fixture.assignIntro);
    await expect(page.getByRole('link', { name: /grade|calificar/i }).first()).toHaveAttribute(
      'href',
      new RegExp(`/mod/assign/view\\.php\\?id=${fixture.assignModule.course_module_id}&action=grader`)
    );
    await expect(page.getByRole('heading', { name: /grading summary|sumario de calificaciones/i }).first()).toBeVisible();
    await expect(body).toContainText(/participants|participantes/i);
    await expect(body).toContainText(/submitted|enviados/i);
    await expect(body).toContainText(/needs grading|pending to grade|pendientes por calificar/i);

    await page.goto(
      `/mod/assign/view.php?id=${fixture.assignModule.course_module_id}` +
      `&action=grader&userid=${fixture.currentUser.id}`
    );
    await expectMoodlePageLoaded(page);
    await expect(page.locator('body')).toContainText(fixture.assignmentSubmissionText);
    await expect(page.locator('body')).toContainText(/submitted|enviado|submitted for grading|enviado para calificar/i);
    await expect(page.locator('body')).toContainText(fixture.assignmentFeedbackComment);
    await expect(page.locator('body')).toContainText(/92\.50|92,50|92\.5|92,5/);
  });

  test('gradebook report shows generated assignment grade subelements', async ({ page }) => {
    expect(fixture.gradeItems.items.some((item) => item.name === fixture.assignName)).toBe(true);
    const assignmentGradeItem = fixture.userGrades.items.find(
      (item) => item.course_module_id === fixture.assignModule.course_module_id
    );
    expect(assignmentGradeItem?.name).toBe(fixture.assignName);
    expect(assignmentGradeItem?.grade_raw).toBe(fixture.assignmentGrade);

    await page.goto(`/grade/report/user/index.php?id=${fixture.course.course_id}&userid=${fixture.currentUser.id}`);
    await expectMoodlePageLoaded(page);

    const body = page.locator('body');
    await expect(body).toContainText(fixture.assignName);
    await expect(body).toContainText(/92\.50|92,50|92\.5|92,5/);
    await expect(body).toContainText(/100\.00|100,00|100/);
  });

  test('subsection activity exposes delegated section metadata on the course page', async ({ page }) => {
    const activity = JSON.parse(fixture.subsectionDetails.extra_json).activity;
    expect(activity.subsection_id).toBe(fixture.subsectionModule.instance_id);
    expect(activity.delegated_section_id).toBeGreaterThan(0);
    expect(activity.delegated_section_name).toBe(fixture.subsectionName);

    await page.goto(`/course/view.php?id=${fixture.course.course_id}`);
    await expectMoodlePageLoaded(page);
    await expect(page.locator('body')).toContainText(fixture.subsectionName);
  });

  test('book activity shows generated shell and chapter listing state', async ({ page }) => {
    expect(fixture.courseBooks.books.some((book) => book.module_id === fixture.bookModule.course_module_id)).toBe(true);
    expect(fixture.bookChapters.chapters).toEqual([]);
    expect(fixture.viewedBook.viewed).toBe(true);

    await page.goto(`/mod/book/view.php?id=${fixture.bookModule.course_module_id}`);
    await expectMoodlePageLoaded(page);

    const body = page.locator('body');
    await expect(page.getByRole('heading', { name: fixture.bookName }).first()).toBeVisible();
    await expect(body).toContainText(/add a new chapter|a[nñ]adir un nuevo cap[ií]tulo/i);
    await expect(body).toContainText(/chapter title|t[ií]tulo del cap[ií]tulo/i);
    await expect(body).toContainText(/subchapter|subcap[ií]tulo/i);
  });

  test('label activity shows inline content subelements on the course page', async ({ page }) => {
    await page.goto(`/course/view.php?id=${fixture.course.course_id}`);
    await expectMoodlePageLoaded(page);

    const body = page.locator('body');
    await expect(body).toContainText(fixture.labelHeading);
    await expect(body).toContainText(fixture.labelListItem);
    await expect(page.getByRole('link', { name: fixture.labelName })).toHaveCount(0);
  });

  test('url activity shows external link subelement without leaving Moodle', async ({ page }) => {
    await page.goto(`/mod/url/view.php?id=${fixture.urlModule.course_module_id}&forceview=1`);
    await expectMoodlePageLoaded(page);
    await expect(page).toHaveURL(new RegExp(`/mod/url/view\\.php\\?id=${fixture.urlModule.course_module_id}&forceview=1`));

    const body = page.locator('body');
    await expect(page.getByRole('heading', { name: fixture.urlName }).first()).toBeVisible();
    await expect(body).toContainText(fixture.urlIntro);

    const embeddedExternalResource = page.locator('iframe, object, embed').first();
    await expect(embeddedExternalResource).toBeVisible();
    const embeddedMarkup = await embeddedExternalResource.evaluate((element) => [
      element.getAttribute('src'),
      element.getAttribute('data'),
      element.getAttribute('title'),
      element.getAttribute('aria-label'),
      element.innerHTML
    ].filter(Boolean).join('\n'));
    expect(embeddedMarkup).toContain(fixture.urlExternalUrl);
    expect(embeddedMarkup).toContain(fixture.urlName);
  });

  test('lti activity exposes launch metadata without leaking user identity by default', async ({ page }) => {
    const activity = JSON.parse(fixture.ltiDetails.extra_json).activity;
    expect(activity.tool_url).toBe(fixture.ltiToolUrl);
    expect(activity.send_name).toBe(false);
    expect(activity.send_email).toBe(false);
    expect(activity.accept_grades).toBe(false);

    await page.goto(`/mod/lti/view.php?id=${fixture.ltiModule.course_module_id}`);
    await expectMoodlePageLoaded(page);

    const body = page.locator('body');
    await expect(page.getByRole('heading', { name: fixture.ltiName }).first()).toBeVisible();
    await expect(body).toContainText(/external tool|herramienta externa/i);
    await expect(page.locator('iframe').first()).toBeVisible();

    const launchMarkup = await page.locator('a, iframe, form, input').evaluateAll((nodes) =>
      nodes.map((node) => [
        node.textContent ?? '',
        node.getAttribute('href') ?? '',
        node.getAttribute('src') ?? '',
        node.getAttribute('action') ?? '',
        node.getAttribute('value') ?? ''
      ].join(' ')).join('\n')
    );
    expect(launchMarkup).toContain(`/mod/lti/launch.php?id=${fixture.ltiModule.course_module_id}`);
  });

  test('choice activity shows options, submitted selection, and results subelements', async ({ page }) => {
    expect(fixture.choiceOptions.options.map((option) => option.text)).toEqual(
      expect.arrayContaining([fixture.choiceOptionOne, fixture.choiceOptionTwo, fixture.choiceOptionThree])
    );
    expect(fixture.submittedChoiceResponse.submitted).toBe(true);
    expect(
      fixture.choiceResults.results.some((result) =>
        result.text === fixture.choiceOptionTwo &&
        result.answer_count >= 1
      )
    ).toBe(true);

    await page.goto(`/mod/choice/view.php?id=${fixture.choiceModule.course_module_id}`);
    await expectMoodlePageLoaded(page);
    await expect(page).toHaveURL(new RegExp(`/mod/choice/view\\.php\\?id=${fixture.choiceModule.course_module_id}`));

    const body = page.locator('body');
    await expect(page.getByRole('heading', { name: fixture.choiceName }).first()).toBeVisible();
    await expect(body).toContainText(fixture.choiceIntro);
    await expect(body).toContainText(fixture.choiceOptionOne);
    await expect(body).toContainText(fixture.choiceOptionTwo);
    await expect(body).toContainText(fixture.choiceOptionThree);
    await expect(body).toContainText(/response|respuesta|answer|selecci/i);
    await expect(body).toContainText(/1|100%|100 %/);
  });

  test('database activity shows generated fields and updated entry subelements', async ({ page }) => {
    const fieldsByName = new Map(fixture.listedDataFields.fields.map((field) => [field.name, field]));
    expect([...fieldsByName.keys()]).toEqual(
      expect.arrayContaining([fixture.dataTitleFieldName, fixture.dataStatusFieldName, fixture.dataNotesFieldName])
    );
    expect(fieldsByName.get(fixture.dataTitleFieldName)).toMatchObject({
      module_id: fixture.dataModule.course_module_id,
      type: 'text',
      required: true
    });
    expect(fieldsByName.get(fixture.dataStatusFieldName)).toMatchObject({
      module_id: fixture.dataModule.course_module_id,
      type: 'menu'
    });
    expect(fieldsByName.get(fixture.dataStatusFieldName).params_json).toContain('Ready');
    expect(fieldsByName.get(fixture.dataNotesFieldName)).toMatchObject({
      module_id: fixture.dataModule.course_module_id,
      type: 'textarea'
    });
    expect(fixture.listedDataEntries.entries.some((entry) => entry.entry_id === fixture.updatedDataEntry.entry_id)).toBe(true);

    await page.goto(`/mod/data/view.php?id=${fixture.dataModule.course_module_id}`);
    await expectMoodlePageLoaded(page);

    const body = page.locator('body');
    await expect(page.getByRole('heading', { name: fixture.dataName }).first()).toBeVisible();
    await expect(body).toContainText(fixture.dataIntro);
    await expect(body).toContainText(fixture.dataTitleFieldName);
    await expect(body).toContainText(fixture.dataStatusFieldName);
    await expect(body).toContainText(fixture.dataNotesFieldName);
    await expect(body).toContainText(fixture.updatedDataEntryTitle);
    await expect(body).toContainText('Ready');
    await expect(body).toContainText(fixture.updatedDataEntryNotes);
    await expect(body).not.toContainText(fixture.dataEntryTitle);

    await page.goto(`/mod/data/field.php?d=${fixture.dataModule.instance_id}`);
    await expectMoodlePageLoaded(page);
    const fieldsBody = page.locator('body');
    await expect(fieldsBody).toContainText(fixture.dataTitleFieldName);
    await expect(fieldsBody).toContainText(fixture.dataStatusFieldName);
    await expect(fieldsBody).toContainText(fixture.dataNotesFieldName);

    await page.goto(`/mod/data/view.php?d=${fixture.dataModule.instance_id}&mode=list`);
    await expectMoodlePageLoaded(page);
    const listBody = page.locator('body');
    await expect(listBody).toContainText(fixture.updatedDataEntryTitle);
    await expect(listBody).toContainText('Ready');
    await expect(listBody).toContainText(fixture.updatedDataEntryNotes);
  });

  test('lesson activity shows generated settings and empty page subelement state', async ({ page }) => {
    expect(fixture.lessonAccessInformation.module_id).toBe(fixture.lessonModule.course_module_id);
    expect(fixture.lessonAccessInformation.lesson_id).toBe(fixture.lessonModule.instance_id);
    expect(fixture.lessonPages.pages).toEqual([]);
    expect(fixture.viewedLesson.viewed).toBe(true);
    expect(fixture.lessonUserGrade.module_id).toBe(fixture.lessonModule.course_module_id);
    expect(fixture.lessonUserTimers.module_id).toBe(fixture.lessonModule.course_module_id);
    expect(fixture.lessonAttemptsOverview.module_id).toBe(fixture.lessonModule.course_module_id);

    await page.goto(`/mod/lesson/view.php?id=${fixture.lessonModule.course_module_id}`);
    await expectMoodlePageLoaded(page);

    const body = page.locator('body');
    await expect(page.getByRole('heading', { name: fixture.lessonName }).first()).toBeVisible();
    await expect(body).toContainText(/editing lesson|editando lecci[oó]n/i);
    await expect(body).toContainText(/what would you like to do first|qu[eé] desea hacer primero/i);
    await expect(body).toContainText(/add a content page|a[nñ]adir una p[aá]gina de contenido/i);
  });

  test('workshop activity shows phase, submission, report, and assessment read subelements', async ({ page }) => {
    expect(fixture.workshopSubmissionPhase.phase).toBe('submission');
    expect(fixture.workshopAssessmentPhase.phase).toBe('assessment');
    expect(fixture.workshopUserPlan.phase_count).toBe(5);
    expect(fixture.workshopGrades.module_id).toBe(fixture.workshopModule.course_module_id);
    expect(fixture.workshopGradesReport.count).toBe(fixture.workshopGradesReport.grades.length);
    expect(fixture.listedWorkshopSubmissions.submissions.some((submission) =>
      submission.submission_id === fixture.updatedWorkshopSubmission.submission_id &&
      submission.title === fixture.updatedWorkshopSubmissionTitle
    )).toBe(true);
    expect(fixture.workshopReviewerAssessments.count).toBe(fixture.workshopReviewerAssessments.assessments.length);
    expect(fixture.workshopSubmissionAssessments.submission_id).toBe(fixture.updatedWorkshopSubmission.submission_id);
    expect(fixture.workshopSubmissionAssessments.count).toBe(fixture.workshopSubmissionAssessments.assessments.length);

    await page.goto(`/mod/workshop/view.php?id=${fixture.workshopModule.course_module_id}`);
    await expectMoodlePageLoaded(page);

    const body = page.locator('body');
    await expect(page.getByRole('heading', { name: fixture.workshopName }).first()).toBeVisible();
    await expect(body).toContainText(/assessment|evaluaci[oó]n|workshop|taller/i);
    await expect(body).toContainText(/submission|env[ií]o|entrega/i);
    await expect(body).toContainText(/grades received|calificaciones recibidas/i);
    await expect(body).toContainText(/grades given|calificaciones otorgadas/i);
    await expect(body).toContainText(/assessment instructions|instrucciones para la evaluaci[oó]n/i);
    await expect(body).toContainText(fixture.updatedWorkshopSubmissionTitle);

    await page.getByRole('link', { name: fixture.updatedWorkshopSubmissionTitle }).first().click();
    await expectMoodlePageLoaded(page);
    await expect(page).toHaveURL(
      new RegExp(`/mod/workshop/submission\\.php\\?cmid=${fixture.workshopModule.course_module_id}&id=${fixture.updatedWorkshopSubmission.submission_id}`)
    );
    await expect(page.locator('body')).toContainText(fixture.updatedWorkshopSubmissionContent);
  });

  test('forum activity shows intro and discussion controls', async ({ page }) => {
    await page.goto(`/mod/forum/view.php?id=${fixture.forumModule.course_module_id}`);
    await expectMoodlePageLoaded(page);
    await expect(page).toHaveURL(new RegExp(`/mod/forum/view\\.php\\?id=${fixture.forumModule.course_module_id}`));

    const body = page.locator('body');
    await expect(page.getByRole('heading', { name: fixture.forumName }).first()).toBeVisible();
    await expect(body).toContainText(fixture.forumIntro);
    await expect(body).toContainText(/discussion|discusion|discusión|debate/i);
    const addDiscussion = page.getByRole('link', {
      name: /add discussion|añadir.*tema de debate|anadir.*tema|agregar.*tema/i
    }).or(page.getByRole('button', {
      name: /add discussion|añadir.*tema de debate|anadir.*tema|agregar.*tema/i
    })).first();
    await expect(addDiscussion).toBeVisible();

    expect(
      fixture.listedForumDiscussions.discussions.some((discussion) =>
        discussion.discussion_id === fixture.forumDiscussion.discussion_id &&
        discussion.name === fixture.forumDiscussionName
      )
    ).toBe(true);
    await expect(page.getByRole('link', { name: fixture.forumDiscussionName }).first()).toHaveAttribute(
      'href',
      new RegExp(`/mod/forum/discuss\\.php\\?d=${fixture.forumDiscussion.discussion_id}`)
    );
  });

  test('forum discussion page shows generated posts and updated reply subelements', async ({ page }) => {
    await page.goto(`/mod/forum/discuss.php?d=${fixture.forumDiscussion.discussion_id}`);
    await expectMoodlePageLoaded(page);
    await expect(page).toHaveURL(new RegExp(`/mod/forum/discuss\\.php\\?d=${fixture.forumDiscussion.discussion_id}`));

    expect(
      fixture.initialForumPosts.posts.some((post) =>
        post.post_id === fixture.forumDiscussion.first_post_id &&
        post.subject === fixture.forumDiscussionName
      )
    ).toBe(true);
    expect(
      fixture.listedForumPosts.posts.some((post) =>
        post.post_id === fixture.updatedForumReply.post_id &&
        post.subject === fixture.updatedForumReplySubject
      )
    ).toBe(true);

    const body = page.locator('body');
    await expect(page.getByRole('heading', { name: fixture.forumDiscussionName }).first()).toBeVisible();
    await expect(body).toContainText(fixture.forumDiscussionMessage);
    await expect(body).toContainText(fixture.updatedForumReplySubject);
    await expect(body).toContainText(fixture.updatedForumReplyMessage);
    await expect(body).not.toContainText(fixture.forumReplySubject);
  });

  test('glossary activity shows generated entry subelements', async ({ page }) => {
    expect(
      fixture.searchedGlossaryEntries.entries.some((entry) =>
        entry.entry_id === fixture.glossaryEntry.entry_id &&
        entry.concept === fixture.glossaryConcept
      )
    ).toBe(true);
    expect(
      fixture.searchedUpdatedGlossaryEntries.entries.some((entry) =>
        entry.entry_id === fixture.updatedGlossaryEntry.entry_id &&
        entry.concept === fixture.updatedGlossaryConcept
      )
    ).toBe(true);

    await page.goto(`/mod/glossary/view.php?id=${fixture.glossaryModule.course_module_id}`);
    await expectMoodlePageLoaded(page);
    await expect(page).toHaveURL(new RegExp(`/mod/glossary/view\\.php\\?id=${fixture.glossaryModule.course_module_id}`));

    const body = page.locator('body');
    await expect(page.getByRole('heading', { name: fixture.glossaryName }).first()).toBeVisible();
    await expect(body).toContainText(fixture.glossaryIntro);
    await expect(body).toContainText(fixture.updatedGlossaryConcept);
    await expect(body).toContainText(fixture.updatedGlossaryDefinition);
    await expect(body).not.toContainText(fixture.glossaryConcept);
  });

  test('wiki activity shows generated page subelements', async ({ page }) => {
    expect(
      fixture.listedWikiPages.pages.some((item) => item.page_id === fixture.wikiPage.page_id)
    ).toBe(true);
    expect(
      fixture.listedUpdatedWikiPages.pages.some((item) =>
        item.page_id === fixture.updatedWikiPage.page_id &&
        item.content.includes(fixture.updatedWikiPageContent)
      )
    ).toBe(true);

    await page.goto(`/mod/wiki/view.php?pageid=${fixture.updatedWikiPage.page_id}`);
    await expectMoodlePageLoaded(page);
    await expect(page).toHaveURL(new RegExp(`/mod/wiki/view\\.php\\?pageid=${fixture.updatedWikiPage.page_id}`));

    const body = page.locator('body');
    await expect(page.getByRole('heading', { name: fixture.wikiPageTitle }).first()).toBeVisible();
    await expect(body).toContainText(fixture.updatedWikiPageContent);
    await expect(body).not.toContainText(fixture.wikiPageContent);
  });

  test('folder activity shows uploaded file subelement', async ({ page }) => {
    await page.goto(`/mod/folder/view.php?id=${fixture.folderModule.course_module_id}`);
    await expectMoodlePageLoaded(page);

    await expect(page.getByRole('heading', { name: fixture.folderName }).first()).toBeVisible();
    const fileLink = page.locator(`a:has-text("${fixture.filename}")`).first();
    await expect(fileLink).toBeVisible();
    await expect(fileLink).toHaveAttribute('href', /pluginfile\.php/);
  });

  test('resource activity shows file metadata and embedded file subelements', async ({ page }) => {
    expect(fixture.resourceFiles.files.some((file) =>
      file.file_id === fixture.downloadedResourceFile.file_id &&
      file.filename === fixture.resourceFilename
    )).toBe(true);

    await page.goto(`/mod/resource/view.php?id=${fixture.resourceModule.course_module_id}&forceview=1`);
    await expectMoodlePageLoaded(page);
    await expect(page).toHaveURL(new RegExp(`/mod/resource/view\\.php\\?id=${fixture.resourceModule.course_module_id}&forceview=1`));

    const body = page.locator('body');
    await expect(page.getByRole('heading', { name: fixture.resourceName }).first()).toBeVisible();
    await expect(body).toContainText(fixture.resourceIntro);

    const embeddedFileTargets = page.locator('a, iframe, object, embed');
    const embeddedMarkup = await embeddedFileTargets.evaluateAll((nodes) =>
      nodes.map((node) => `${node.textContent ?? ''} ${node.getAttribute('href') ?? ''} ${node.getAttribute('src') ?? ''} ${node.getAttribute('data') ?? ''}`).join('\n')
    );
    expect(embeddedMarkup).toContain(fixture.resourceFilename);
    expect(embeddedMarkup).toContain('pluginfile.php');
  });

  test('quiz questions page shows generated question slots', async ({ page }) => {
    const quizQuestionsById = new Map(
      fixture.listedQuizQuestions.questions.map((question) => [question.question_id, question])
    );
    expect(quizQuestionsById.get(fixture.trueFalseQuestion.question_id)).toMatchObject({
      name: fixture.trueFalseQuestionName,
      question_type: 'truefalse',
      maxmark: 2.5
    });
    expect(quizQuestionsById.get(fixture.shortAnswerQuestion.question_id)).toMatchObject({
      name: fixture.shortAnswerQuestionName,
      question_type: 'shortanswer'
    });
    expect(quizQuestionsById.get(fixture.multichoiceQuestion.question_id)).toMatchObject({
      name: fixture.multichoiceQuestionName,
      question_type: 'multichoice'
    });
    expect(quizQuestionsById.get(fixture.numericalQuestion.question_id)).toMatchObject({
      name: fixture.numericalQuestionName,
      question_type: 'numerical'
    });
    expect(quizQuestionsById.get(fixture.matchingQuestion.question_id)).toMatchObject({
      name: fixture.matchingQuestionName,
      question_type: 'matching'
    });
    expect(quizQuestionsById.get(fixture.essayQuestion.question_id)).toMatchObject({
      name: fixture.essayQuestionName,
      question_type: 'essay'
    });
    expect(quizQuestionsById.has(fixture.removableQuizQuestion.question_id)).toBe(false);
    expect(fixture.listedQuizQuestions.questions.some((question) => question.question_type === 'random')).toBe(true);

    await page.goto(`/mod/quiz/edit.php?cmid=${fixture.quizModule.course_module_id}`);
    await expectMoodlePageLoaded(page);

    const body = page.locator('body');
    await expect(body).toContainText(fixture.trueFalseQuestionName);
    await expect(body).toContainText(fixture.shortAnswerQuestionName);
    await expect(body).toContainText(fixture.multichoiceQuestionName);
    await expect(body).toContainText(fixture.numericalQuestionName);
    await expect(body).toContainText(fixture.matchingQuestionName);
    await expect(body).toContainText(fixture.essayQuestionName);
    await expect(body).not.toContainText(fixture.removableQuizQuestionName);
    expect(fixture.randomQuizQuestions.added_count).toBe(1);
    await expect(body).toContainText(/random|aleatoria/i);
    await expect(body).toContainText(/2\.50|2,50|2\.5|2,5/);
    await expect(body).toContainText(/1\.00|1,00|1/);
  });

  test('question bank views show shared and private category subelements', async ({ page }) => {
    await page.goto(
      `/question/edit.php?cmid=${fixture.sharedCategory.question_bank_module_id}` +
      `&category=${fixture.sharedCategory.category_id},${fixture.sharedCategory.context_id}`
    );
    await expectMoodlePageLoaded(page);
    await expect(page.locator('body')).toContainText(fixture.sharedCategoryName);
    await expect(page.locator('body')).toContainText(fixture.trueFalseQuestionName);
    await expect(page.locator('body')).toContainText(fixture.multichoiceQuestionName);
    await expect(page.locator('body')).toContainText(fixture.numericalQuestionName);
    await expect(page.locator('body')).toContainText(fixture.matchingQuestionName);
    await expect(page.locator('body')).toContainText(fixture.essayQuestionName);
    await expect(page.locator('body')).toContainText(fixture.randomPoolQuestionName);

    await page.goto(
      `/question/edit.php?cmid=${fixture.moveTargetCategory.question_bank_module_id}` +
      `&category=${fixture.moveTargetCategory.category_id},${fixture.moveTargetCategory.context_id}`
    );
    await expectMoodlePageLoaded(page);
    await expect(page.locator('body')).toContainText(fixture.moveTargetCategoryName);
    await expect(page.locator('body')).toContainText(fixture.movableQuestionName);

    await page.goto(
      `/question/edit.php?cmid=${fixture.quizModule.course_module_id}` +
      `&category=${fixture.privateCategory.category_id},${fixture.privateCategory.context_id}`
    );
    await expectMoodlePageLoaded(page);
    await expect(page.locator('body')).toContainText(fixture.privateCategoryName);
    await expect(page.locator('body')).toContainText(fixture.shortAnswerQuestionName);
  });

  test('quiz preview attempt renders generated question subelements', async ({ page }) => {
    expect(fixture.startedQuizAttempt.quiz_module_id).toBe(fixture.quizModule.course_module_id);
    expect(fixture.startedQuizAttempt.attempt.attempt_id).toBeGreaterThan(0);
    expect(fixture.startedQuizAttempt.attempt.state).toBe('inprogress');
    expect(
      fixture.listedQuizAttempts.attempts.some(
        (attempt) => attempt.attempt_id === fixture.startedQuizAttempt.attempt.attempt_id
      )
    ).toBe(true);

    await page.goto(`/mod/quiz/view.php?id=${fixture.quizModule.course_module_id}`);
    await expectMoodlePageLoaded(page);

    const startControl = page.getByRole('button', {
      name: /attempt|preview|continue|start|intentar|previsualizar|vista previa|continuar|comenzar|resolver/i
    }).or(page.getByRole('link', {
      name: /attempt|preview|continue|start|intentar|previsualizar|vista previa|continuar|comenzar|resolver/i
    })).first();

    await expect(startControl).toBeVisible();
    await startControl.click();
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    const modalStart = page.getByRole('button', {
      name: /start attempt|begin attempt|comenzar intento|iniciar intento|empezar intento/i
    }).first();

    if (await modalStart.isVisible().catch(() => false)) {
      await modalStart.click();
      await page.waitForLoadState('domcontentloaded').catch(() => {});
    }

    await expect(page.locator('body')).not.toContainText(/ninguna de las preguntas tienen una calificaci[oó]n/i);
    await expect(page.locator('body')).not.toContainText(/none of the questions have a grade/i);
    await expect(page).toHaveURL(/\/mod\/quiz\/attempt\.php/);

    const body = page.locator('body');
    await expect(body).toContainText(fixture.trueFalseQuestionText);
    await expect(body).toContainText(/True|Verdadero|Falso|False/i);

    const nextPage = page.getByRole('button', {
      name: /next page|siguiente p[aá]gina|siguiente|next/i
    }).first();
    await expect(nextPage).toBeVisible();
    await nextPage.click();
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    await expect(body).toContainText(fixture.shortAnswerQuestionText);
    await expect(page.locator('input[type="text"], textarea').first()).toBeVisible();

    const nextPageAfterShortAnswer = page.getByRole('button', {
      name: /next page|siguiente p[aÃ¡]gina|siguiente|next/i
    }).first();
    await expect(nextPageAfterShortAnswer).toBeVisible();
    await nextPageAfterShortAnswer.click();
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    await expect(body).toContainText(fixture.multichoiceQuestionText);
    await expect(body).toContainText(fixture.multichoiceCorrectAnswer);
    await expect(body).toContainText(fixture.multichoiceDistractorOne);
    await expect(body).toContainText(fixture.multichoiceDistractorTwo);
    await expect(page.locator('input[type="radio"]').first()).toBeVisible();

    const nextPageAfterMultichoice = page.getByRole('button', {
      name: /next page|siguiente p[aÃ¡]gina|siguiente|next/i
    }).first();
    await expect(nextPageAfterMultichoice).toBeVisible();
    await nextPageAfterMultichoice.click();
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    await expect(body).toContainText(fixture.numericalQuestionText);
    await expect(page.locator('input[type="text"], input[type="number"]').first()).toBeVisible();

    const nextPageAfterNumerical = page.getByRole('button', {
      name: /next page|siguiente p[aÃ¡]gina|siguiente|next/i
    }).first();
    await expect(nextPageAfterNumerical).toBeVisible();
    await nextPageAfterNumerical.click();
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    await expect(body).toContainText(fixture.matchingQuestionText);
    await expect(body).toContainText(fixture.matchingStemOne);
    await expect(body).toContainText(fixture.matchingStemTwo);
    await expect(body).toContainText(fixture.matchingStemThree);
    await expect(body).toContainText(fixture.matchingAnswerOne);
    await expect(body).toContainText(fixture.matchingAnswerTwo);
    await expect(body).toContainText(fixture.matchingAnswerThree);
    await expect(page.locator('select').first()).toBeVisible();

    const nextPageAfterMatching = page.getByRole('button', {
      name: /next page|siguiente p[aÃƒÂ¡]gina|siguiente|next/i
    }).first();
    await expect(nextPageAfterMatching).toBeVisible();
    await nextPageAfterMatching.click();
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    await expect(body).toContainText(fixture.essayQuestionText);
    await expect(body).toContainText(fixture.essayResponseTemplate);
    await expect(page.locator('textarea').first()).toBeVisible();
  });
});
