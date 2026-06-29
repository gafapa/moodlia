import { loadContract, toRestFunctionName } from '../tests/helpers/contract.mjs';
import { callRestFunction } from '../tests/helpers/moodle-rest.mjs';

const contract = await loadContract();
const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const resetCourses = process.argv.includes('--reset-courses') || process.env.MOODLIA_DEMO_RESET_COURSES === '1';
const courseCategoryName = `MoodlIA Full Course Category ${suffix}`;
const updatedCourseCategoryName = `MoodlIA Generated Courses ${suffix}`;
const fullCourseName = `MoodlIA Full Course ${suffix}`;
const shortCourseName = `moodlia-full-${suffix}`;

function restName(operationName) {
  return toRestFunctionName(contract, operationName);
}

function normalizeCourses(payload) {
  const courses = Array.isArray(payload) ? payload : payload?.courses ?? [];
  return courses
    .map((course) => ({
      id: Number(course.id ?? course.course_id),
      shortname: course.shortname ?? course.short_name ?? '',
      fullname: course.fullname ?? course.full_name ?? course.name ?? ''
    }))
    .filter((course) => Number.isInteger(course.id) && course.id > 1);
}

async function call(operationName, parameters = {}) {
  return callRestFunction(restName(operationName), parameters);
}

async function clearCourseDefaults(courseId) {
  const contents = await call('get_course_contents', {
    course_id: courseId
  });
  const deletedModules = [];
  const deletedSections = [];
  const deleteWarnings = [];

  for (const section of contents.sections) {
    for (const module of section.modules) {
      try {
        const deleted = await call('delete_module', {
          course_id: courseId,
          module_id: module.course_module_id
        });
        deletedModules.push({
          section_number: section.section_number,
          module_id: module.course_module_id,
          name: module.name,
          module_type: module.module_type,
          deleted: deleted.deleted === true
        });
      } catch (error) {
        deleteWarnings.push({
          type: 'module',
          section_number: section.section_number,
          module_id: module.course_module_id,
          name: module.name,
          module_type: module.module_type,
          error: error.message
        });
      }
    }
  }

  const nonZeroSections = contents.sections
    .filter((section) => section.section_number > 0)
    .sort((left, right) => right.section_number - left.section_number);

  for (const section of nonZeroSections) {
    try {
      const deleted = await call('delete_section', {
        course_id: courseId,
        section_number: section.section_number
      });
      deletedSections.push({
        section_id: section.section_id,
        section_number: section.section_number,
        name: section.name,
        deleted: deleted.deleted === true
      });
    } catch (error) {
      deleteWarnings.push({
        type: 'section',
        section_id: section.section_id,
        section_number: section.section_number,
        name: section.name,
        error: error.message
      });
    }
  }

  return {
    before: contents,
    deleted_modules: deletedModules,
    deleted_sections: deletedSections,
    warnings: deleteWarnings,
    after: await call('get_course_contents', {
      course_id: courseId
    })
  };
}

const beforeCourses = normalizeCourses(await call('get_courses'));
const deletedCourses = [];
const deleteFailures = [];

if (resetCourses) {
  for (const course of beforeCourses) {
    try {
      const deleted = await call('delete_course', {
        course_id: course.id
      });
      deletedCourses.push({
        ...course,
        deleted: deleted.deleted === true
      });
    } catch (error) {
      deleteFailures.push({
        ...course,
        error: error.message
      });
    }
  }
}

if (deleteFailures.length > 0) {
  throw new Error(`Course deletion failed before fixture creation: ${JSON.stringify(deleteFailures)}`);
}

const createdCourseCategory = await call('create_course_category', {
  name: courseCategoryName,
  visible: 1
});

const updatedCourseCategory = await call('update_course_category', {
  category_id: createdCourseCategory.category_id,
  name: updatedCourseCategoryName,
  visible: 1
});

const listedCourseCategories = await call('get_course_categories', {
  parent_id: -1
});

const createdCourse = await call('create_course', {
  fullname: fullCourseName,
  shortname: shortCourseName,
  category_id: updatedCourseCategory.category_id,
  visible: 1
});

const courseId = createdCourse.course_id;
const clearedCourseDefaults = await clearCourseDefaults(courseId);
const calendarEventStart = Math.floor(Date.now() / 1000) + 172800;
const calendarEvent = await call('create_calendar_event', {
  course_id: courseId,
  name: 'MoodlIA Generated Calendar Event',
  timestart: calendarEventStart,
  description: '<p>Generated course calendar event for browser verification.</p>',
  timeduration: 3600
});

const listedCalendarEvents = await call('get_calendar_events', {
  course_id: courseId,
  time_from: calendarEventStart - 3600,
  time_to: calendarEventStart + 7200
});

const currentUser = await call('get_current_user');
const enrolledUser = await call('enrol_user', {
  course_id: courseId,
  user_id: currentUser.id,
  role_archetype: 'student'
});
const enrolledUsers = await call('get_enrolled_users', {
  course_id: courseId
});

const group = await call('create_group', {
  course_id: courseId,
  name: 'MoodlIA Generated Group',
  description: '<p>Generated group for course participant management verification.</p>'
});
const groupMember = await call('add_group_member', {
  course_id: courseId,
  group_id: group.group_id,
  user_id: currentUser.id
});
const listedGroups = await call('get_groups', {
  course_id: courseId
});
const listedGroupMembers = await call('get_group_members', {
  course_id: courseId,
  group_id: group.group_id
});

const createdSection = await call('create_section', {
  course_id: courseId,
  name: 'MoodlIA Main Section',
  summary: 'Created by MoodlIA automation after resetting courses.'
});

const updatedSection = await call('update_section', {
  course_id: courseId,
  section_id: createdSection.section_id,
  name: 'MoodlIA Complete Content',
  summary: 'This section contains page, folder, files, quiz, and question bank content.'
});

const movedContentSection = await call('create_section', {
  course_id: courseId,
  name: 'MoodlIA Moved Content',
  summary: 'This section demonstrates moving an existing duplicated activity through MoodlIA.'
});

const subsectionModule = await call('create_module', {
  course_id: courseId,
  section_number: createdSection.section_number,
  module_type: 'subsection',
  name: 'MoodlIA Generated Subsection',
  options: JSON.stringify({
    visible: true,
    visible_on_course_page: true
  })
});

const subsectionDetails = await call('get_module_details', {
  course_id: courseId,
  module_id: subsectionModule.course_module_id
});

const qbankModule = await call('create_module', {
  course_id: courseId,
  section_number: 0,
  module_type: 'qbank',
  name: 'MoodlIA Generated Question Bank',
  options: JSON.stringify({
    intro: '<p>This explicit question bank owns generated shared question categories.</p>',
    visible: true,
    show_description: true
  })
});

const qbankDetails = await call('get_module_details', {
  course_id: courseId,
  module_id: qbankModule.course_module_id
});

const pageModule = await call('create_module', {
  course_id: courseId,
  section_number: createdSection.section_number,
  module_type: 'page',
  name: 'MoodlIA Overview Page Draft',
  options: JSON.stringify({
    content: [
      '<h3>MoodlIA generated course</h3>',
      '<p>This page was created through the shared REST operation surface.</p>',
      '<ul><li>REST API</li><li>MCP tools/call</li><li>Node CLI parity</li></ul>'
    ].join('')
  })
});

const hiddenPageModule = await call('update_module', {
  course_id: courseId,
  module_id: pageModule.course_module_id,
  name: 'MoodlIA Overview Page',
  visible: 0
});

const visiblePageModule = await call('update_module', {
  course_id: courseId,
  module_id: pageModule.course_module_id,
  visible: 1
});

const duplicatedPageModule = await call('duplicate_module', {
  course_id: courseId,
  module_id: pageModule.course_module_id,
  section_number: createdSection.section_number,
  name: 'MoodlIA Duplicated Overview Page'
});

const movedDuplicatedPageModule = await call('move_module', {
  course_id: courseId,
  module_id: duplicatedPageModule.course_module_id,
  section_number: movedContentSection.section_number
});

const assignModule = await call('create_module', {
  course_id: courseId,
  section_number: createdSection.section_number,
  module_type: 'assign',
  name: 'MoodlIA Generated Assignment',
  options: JSON.stringify({
    intro: '<p>Submit a short explanation of how MoodlIA generated this course.</p>',
    online_text: true,
    file_submissions: false
  })
});

const assignmentSubmission = await call('save_assignment_submission', {
  course_id: courseId,
  module_id: assignModule.course_module_id,
  online_text: '<p>This generated online text submission verifies assignment submission automation.</p>'
});

const submittedAssignment = await call('submit_assignment_for_grading', {
  course_id: courseId,
  module_id: assignModule.course_module_id,
  accept_submission_statement: 1
});

const gradedAssignment = await call('save_assignment_grade', {
  course_id: courseId,
  module_id: assignModule.course_module_id,
  user_id: currentUser.id,
  grade: 91.5,
  feedback_comment: '<p>This generated feedback verifies assignment grading automation.</p>'
});

const bookModule = await call('create_module', {
  course_id: courseId,
  section_number: createdSection.section_number,
  module_type: 'book',
  name: 'MoodlIA Generated Book',
  options: JSON.stringify({
    intro: '<p>This generated book activity verifies Moodle book module support.</p>',
    numbering: 'numbers',
    custom_titles: false
  })
});

const viewedBook = await call('view_book', {
  course_id: courseId,
  module_id: bookModule.course_module_id
});

const gradeItems = await call('get_grade_items', {
  course_id: courseId
});

const userGrades = await call('get_user_grades', {
  course_id: courseId,
  user_id: currentUser.id
});

const labelModule = await call('create_module', {
  course_id: courseId,
  section_number: createdSection.section_number,
  module_type: 'label',
  name: 'MoodlIA Inline Guidance',
  options: JSON.stringify({
    content: [
      '<div>',
      '<strong>MoodlIA inline course guidance</strong>',
      '<p>This text and media area is rendered directly on the Moodle course page.</p>',
      '<ul><li>Generated through create_module with module_type=label.</li></ul>',
      '</div>'
    ].join('')
  })
});

const urlModule = await call('create_module', {
  course_id: courseId,
  section_number: createdSection.section_number,
  module_type: 'url',
  name: 'MoodlIA External Reference',
  options: JSON.stringify({
    external_url: 'https://moodledev.io/',
    intro: '<p>Official Moodle developer documentation linked from a generated URL activity.</p>'
  })
});

const ltiModule = await call('create_module', {
  course_id: courseId,
  section_number: createdSection.section_number,
  module_type: 'lti',
  name: 'MoodlIA External Tool',
  options: JSON.stringify({
    intro: '<p>This generated external tool verifies Moodle LTI activity support without sharing user identity by default.</p>',
    tool_url: `https://example.com/moodlia/lti/full-course-${courseId}`,
    launch_container: 'embed_no_blocks',
    send_name: false,
    send_email: false,
    allow_roster: false,
    allow_setting: false,
    accept_grades: false,
    custom_parameters: `moodlia_course_id=${courseId}`,
    show_title_launch: true
  })
});

const ltiDetails = await call('get_module_details', {
  course_id: courseId,
  module_id: ltiModule.course_module_id
});

const dataModule = await call('create_module', {
  course_id: courseId,
  section_number: createdSection.section_number,
  module_type: 'data',
  name: 'MoodlIA Generated Database',
  options: JSON.stringify({
    intro: '<p>This generated database activity verifies field and entry management support.</p>',
    approval_required: false,
    manage_approved: false,
    required_entries: 0,
    required_entries_to_view: 0,
    max_entries: 0,
    edit_any: true
  })
});

const dataTitleField = await call('create_data_field', {
  course_id: courseId,
  module_id: dataModule.course_module_id,
  field_type: 'text',
  name: 'MoodlIA Title',
  description: 'Generated title field.',
  required: 1
});

const dataStatusField = await call('create_data_field', {
  course_id: courseId,
  module_id: dataModule.course_module_id,
  field_type: 'menu',
  name: 'MoodlIA Status',
  description: 'Generated status field.',
  options: JSON.stringify({
    choices: ['Draft', 'Ready', 'Archived']
  })
});

const dataNotesField = await call('create_data_field', {
  course_id: courseId,
  module_id: dataModule.course_module_id,
  field_type: 'textarea',
  name: 'MoodlIA Notes',
  description: 'Generated notes field.',
  options: JSON.stringify({
    rows: 4,
    columns: 60
  })
});

const dataTemporaryField = await call('create_data_field', {
  course_id: courseId,
  module_id: dataModule.course_module_id,
  field_type: 'text',
  name: 'MoodlIA Temporary Field',
  description: 'Generated temporary field for update and delete verification.'
});

const updatedDataTemporaryField = await call('update_data_field', {
  course_id: courseId,
  module_id: dataModule.course_module_id,
  field_id: dataTemporaryField.field_id,
  name: 'MoodlIA Temporary Field Updated',
  description: 'Updated temporary field before deletion.',
  required: 0
});

const deletedDataTemporaryField = await call('delete_data_field', {
  course_id: courseId,
  module_id: dataModule.course_module_id,
  field_id: updatedDataTemporaryField.field_id
});

const dataEntry = await call('create_data_entry', {
  course_id: courseId,
  module_id: dataModule.course_module_id,
  values: JSON.stringify({
    'MoodlIA Title': 'Generated database entry',
    'MoodlIA Status': 'Draft',
    'MoodlIA Notes': 'This entry was created by MoodlIA automation.'
  })
});

const updatedDataEntry = await call('update_data_entry', {
  course_id: courseId,
  module_id: dataModule.course_module_id,
  entry_id: dataEntry.entry_id,
  values: JSON.stringify({
    'MoodlIA Title': 'Updated generated database entry',
    'MoodlIA Status': 'Ready',
    'MoodlIA Notes': 'This entry was updated through the shared operation contract.'
  })
});

const listedDataFields = await call('get_data_fields', {
  course_id: courseId,
  module_id: dataModule.course_module_id
});

const listedDataEntries = await call('get_data_entries', {
  course_id: courseId,
  module_id: dataModule.course_module_id,
  include_contents: 1
});

const dataDetails = await call('get_module_details', {
  course_id: courseId,
  module_id: dataModule.course_module_id
});

const lessonModule = await call('create_module', {
  course_id: courseId,
  section_number: createdSection.section_number,
  module_type: 'lesson',
  name: 'MoodlIA Generated Lesson',
  options: JSON.stringify({
    intro: '<p>This generated lesson verifies lesson module settings and public Lesson APIs.</p>',
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
  course_id: courseId,
  module_id: lessonModule.course_module_id
});

const lessonPages = await call('get_lesson_pages', {
  course_id: courseId,
  module_id: lessonModule.course_module_id
});

const viewedLesson = await call('view_lesson', {
  course_id: courseId,
  module_id: lessonModule.course_module_id
});

const lessonUserGrade = await call('get_lesson_user_grade', {
  course_id: courseId,
  module_id: lessonModule.course_module_id
});

const lessonUserTimers = await call('get_lesson_user_timers', {
  course_id: courseId,
  module_id: lessonModule.course_module_id
});

const lessonAttemptsOverview = await call('get_lesson_attempts_overview', {
  course_id: courseId,
  module_id: lessonModule.course_module_id
});

const choiceModule = await call('create_module', {
  course_id: courseId,
  section_number: createdSection.section_number,
  module_type: 'choice',
  name: 'MoodlIA Generated Choice',
  options: JSON.stringify({
    intro: '<p>Choose the interface that should be used for fast CLI automation.</p>',
    choices: ['REST API', 'MCP tool call', 'Moodle plugin UI']
  })
});

const choiceOptions = await call('get_choice_options', {
  course_id: courseId,
  choice_module_id: choiceModule.course_module_id
});
const restChoiceOption = choiceOptions.options.find((option) => option.text === 'REST API') ?? choiceOptions.options[0];
const submittedChoiceResponse = await call('submit_choice_response', {
  course_id: courseId,
  choice_module_id: choiceModule.course_module_id,
  option_ids: JSON.stringify([restChoiceOption.option_id])
});
const choiceResults = await call('get_choice_results', {
  course_id: courseId,
  choice_module_id: choiceModule.course_module_id
});

const forumModule = await call('create_module', {
  course_id: courseId,
  section_number: createdSection.section_number,
  module_type: 'forum',
  name: 'MoodlIA Discussion Forum',
  options: JSON.stringify({
    forum_type: 'general',
    intro: '<p>Use this generated forum for course discussion and participation verification.</p>'
  })
});

const forumDiscussion = await call('create_forum_discussion', {
  course_id: courseId,
  module_id: forumModule.course_module_id,
  name: 'MoodlIA Generated Discussion',
  message: '<p>This generated discussion verifies forum subelement creation.</p>'
});

const forumReply = await call('create_forum_discussion_post', {
  course_id: courseId,
  module_id: forumModule.course_module_id,
  discussion_id: forumDiscussion.discussion_id,
  parent_post_id: forumDiscussion.first_post_id,
  subject: 'MoodlIA Generated Reply',
  message: '<p>This generated reply verifies nested forum post creation.</p>'
});

const updatedForumReply = await call('update_forum_discussion_post', {
  course_id: courseId,
  module_id: forumModule.course_module_id,
  discussion_id: forumDiscussion.discussion_id,
  post_id: forumReply.post_id,
  subject: 'MoodlIA Updated Generated Reply',
  message: '<p>This updated generated reply verifies forum post editing.</p>'
});

const forumPosts = await call('get_forum_discussion_posts', {
  course_id: courseId,
  module_id: forumModule.course_module_id,
  discussion_id: forumDiscussion.discussion_id
});

const glossaryModule = await call('create_module', {
  course_id: courseId,
  section_number: createdSection.section_number,
  module_type: 'glossary',
  name: 'MoodlIA Generated Glossary',
  options: JSON.stringify({
    intro: '<p>This generated glossary verifies glossary activity and entry management support.</p>',
    display_format: 'dictionary',
    allow_comments: true
  })
});

const glossaryEntry = await call('create_glossary_entry', {
  course_id: courseId,
  module_id: glossaryModule.course_module_id,
  concept: 'MoodlIA shared contract',
  definition: '<p>A canonical operation contract used by the REST API, MCP tools, and Node CLI.</p>',
  definition_format: 'html',
  options: JSON.stringify({
    aliases: ['MoodlIA contract', 'shared operation contract'],
    usedynalink: true
  })
});

const searchedGlossaryEntries = await call('search_glossary_entries', {
  course_id: courseId,
  module_id: glossaryModule.course_module_id,
  query: 'MoodlIA shared contract',
  full_search: 1,
  include_not_approved: 1
});

const updatedGlossaryEntry = await call('update_glossary_entry', {
  course_id: courseId,
  module_id: glossaryModule.course_module_id,
  entry_id: glossaryEntry.entry_id,
  concept: 'MoodlIA shared interface',
  definition: '<p>A synchronized REST, MCP, and Node CLI surface backed by Moodle core APIs.</p>',
  definition_format: 'html',
  options: JSON.stringify({
    aliases: ['MoodlIA interface', 'shared operation surface'],
    usedynalink: true
  })
});

const searchedUpdatedGlossaryEntries = await call('search_glossary_entries', {
  course_id: courseId,
  module_id: glossaryModule.course_module_id,
  query: 'MoodlIA shared interface',
  full_search: 1,
  include_not_approved: 1
});

const wikiModule = await call('create_module', {
  course_id: courseId,
  section_number: createdSection.section_number,
  module_type: 'wiki',
  name: 'MoodlIA Generated Wiki',
  options: JSON.stringify({
    intro: '<p>This generated wiki verifies wiki activity and page management support.</p>',
    first_page_title: 'MoodlIA Wiki Home',
    wiki_mode: 'collaborative',
    default_format: 'html'
  })
});

const wikiPage = await call('create_wiki_page', {
  course_id: courseId,
  module_id: wikiModule.course_module_id,
  title: 'MoodlIA Generated Wiki Page',
  content: '<h3>MoodlIA generated wiki page</h3><p>This page was created through the shared API contract.</p>',
  content_format: 'html'
});

const listedWikiPages = await call('get_wiki_pages', {
  course_id: courseId,
  module_id: wikiModule.course_module_id,
  sort_by: 'title',
  sort_direction: 'ASC',
  include_content: 1
});

const updatedWikiPage = await call('update_wiki_page', {
  course_id: courseId,
  module_id: wikiModule.course_module_id,
  page_id: wikiPage.page_id,
  content: '<h3>MoodlIA updated wiki page</h3><p>This page was updated through REST, with the same operation available through MCP and CLI.</p>'
});

const listedUpdatedWikiPages = await call('get_wiki_pages', {
  course_id: courseId,
  module_id: wikiModule.course_module_id,
  sort_by: 'title',
  sort_direction: 'ASC',
  include_content: 1
});

const now = Math.floor(Date.now() / 1000);
const workshopModule = await call('create_module', {
  course_id: courseId,
  section_number: createdSection.section_number,
  module_type: 'workshop',
  name: 'MoodlIA Generated Workshop',
  options: JSON.stringify({
    intro: '<p>This generated workshop verifies workshop phase and submission management support.</p>',
    strategy: 'accumulative',
    submission_grade: 80,
    assessment_grade: 20,
    submission_instructions: '<p>Submit a short generated sample for workshop verification.</p>',
    assessment_instructions: '<p>Review the generated workshop submission.</p>',
    text_submission: 'required',
    file_submission: 'available',
    max_submission_attachments: 1,
    late_submissions: true,
    self_assessment: true,
    submission_start: now - 60,
    submission_end: now + 3600,
    assessment_start: now + 7200,
    assessment_end: now + 10800,
    conclusion: '<p>This workshop was generated and populated through MoodlIA operations.</p>'
  })
});

const workshopSubmissionPhase = await call('set_workshop_phase', {
  course_id: courseId,
  module_id: workshopModule.course_module_id,
  phase: 'submission'
});

const workshopUserPlan = await call('get_workshop_user_plan', {
  course_id: courseId,
  module_id: workshopModule.course_module_id
});

const workshopGrades = await call('get_workshop_grades', {
  course_id: courseId,
  module_id: workshopModule.course_module_id
});

const workshopSubmission = await call('create_workshop_submission', {
  course_id: courseId,
  module_id: workshopModule.course_module_id,
  title: 'MoodlIA Generated Workshop Submission',
  content: '<p>This workshop submission was created through the shared REST operation surface.</p>',
  content_format: 'html'
});

const workshopGradesReport = await call('get_workshop_grades_report', {
  course_id: courseId,
  module_id: workshopModule.course_module_id,
  sort_by: 'submissiontitle',
  sort_direction: 'ASC',
  page: 0,
  per_page: 20
});

const updatedWorkshopSubmission = await call('update_workshop_submission', {
  course_id: courseId,
  module_id: workshopModule.course_module_id,
  submission_id: workshopSubmission.submission_id,
  title: 'MoodlIA Updated Workshop Submission',
  content: '<p>This workshop submission was updated through the same canonical operation contract.</p>',
  content_format: 'html'
});

const listedWorkshopSubmissions = await call('get_workshop_submissions', {
  course_id: courseId,
  module_id: workshopModule.course_module_id
});

const folderModule = await call('create_module', {
  course_id: courseId,
  section_number: createdSection.section_number,
  module_type: 'folder',
  name: 'MoodlIA Resource Folder',
  options: '{}'
});

const uploadedFile = await call('upload_folder_file', {
  course_id: courseId,
  module_id: folderModule.course_module_id,
  filename: 'moodlia-generated-notes.txt',
  upload_reference: Buffer.from(`MoodlIA generated file for course ${courseId}\nCreated at ${new Date().toISOString()}\n`, 'utf8').toString('base64')
});

const downloadedFile = await call('download_folder_file', {
  course_id: courseId,
  module_id: folderModule.course_module_id,
  file_id: uploadedFile.file_id
});

const listedFolderFiles = await call('get_folder_files', {
  course_id: courseId,
  module_id: folderModule.course_module_id
});

const resourceModule = await call('create_module', {
  course_id: courseId,
  section_number: createdSection.section_number,
  module_type: 'resource',
  name: 'MoodlIA Single File Resource',
  options: JSON.stringify({
    intro: '<p>This generated file resource verifies Moodle resource activity support.</p>',
    filename: 'moodlia-generated-resource.txt',
    upload_reference: Buffer.from(`MoodlIA generated single file resource for course ${courseId}\nCreated at ${new Date().toISOString()}\n`, 'utf8').toString('base64'),
    display: 'embed',
    print_intro: true
  })
});

const listedResourceFiles = await call('get_resource_files', {
  course_id: courseId,
  module_id: resourceModule.course_module_id
});
const resourceFile = listedResourceFiles.files.find((file) => file.filename === 'moodlia-generated-resource.txt');
const downloadedResourceFile = await call('download_resource_file', {
  course_id: courseId,
  module_id: resourceModule.course_module_id,
  file_id: resourceFile.file_id
});

const questionCategory = await call('create_question_category', {
  course_id: courseId,
  name: 'MoodlIA Generated Questions',
  description: 'Questions generated through MoodlIA operations.'
});

const secondaryQuestionCategory = await call('create_question_category', {
  course_id: courseId,
  name: 'MoodlIA Extra Question Category',
  description: 'Additional generated category for management verification.'
});

const trueFalseQuestion = await call('create_question', {
  category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
  question_type: 'truefalse',
  name: 'MoodlIA True/False Question',
  question_text: '<p>MoodlIA can create Moodle content through shared API operations.</p>',
  options: JSON.stringify({
    correct_answer: true,
    feedback_true: 'Correct.',
    feedback_false: 'Review the generated course content.'
  })
});

const multichoiceQuestion = await call('create_question', {
  category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
  question_type: 'multichoice',
  name: 'MoodlIA Multiple Choice Question',
  question_text: '<p>Which operation surface does the Node CLI use directly?</p>',
  options: JSON.stringify({
    single: true,
    shuffle_answers: false,
    answer_numbering: 'abc',
    answers: [
      {
        text: 'Moodle REST',
        fraction: 1,
        feedback: 'Correct.'
      },
      {
        text: 'MCP tools/call',
        fraction: 0,
        feedback: 'The CLI uses REST directly; MCP is a parallel interface.'
      },
      {
        text: 'A custom Moodle UI',
        fraction: 0,
        feedback: 'MoodlIA does not require a custom plugin UI.'
      }
    ],
    correct_feedback: 'Correct.',
    incorrect_feedback: 'Review the generated course overview.'
  })
});

const numericalQuestion = await call('create_question', {
  category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
  question_type: 'numerical',
  name: 'MoodlIA Numerical Question',
  question_text: '<p>How many functional interfaces does MoodlIA expose?</p>',
  options: JSON.stringify({
    answers: [
      {
        text: '3',
        tolerance: '0',
        fraction: 1,
        feedback: 'Correct.'
      }
    ]
  })
});

const essayQuestion = await call('create_question', {
  category_id: questionCategory.category_id,
      context_id: questionCategory.context_id,
  question_type: 'essay',
  name: 'MoodlIA Essay Question',
  question_text: '<p>Explain how MoodlIA keeps generated Moodle content verifiable.</p>',
  options: JSON.stringify({
    response_format: 'plain',
    response_required: true,
    response_field_lines: 10,
    response_template: 'Mention REST, MCP, CLI, and browser verification.',
    grader_info: '<p>Look for the shared contract and browser-visible verification.</p>'
  })
});

const quizModule = await call('create_module', {
  course_id: courseId,
  section_number: createdSection.section_number,
  module_type: 'quiz',
  name: 'MoodlIA Generated Quiz',
  options: '{}'
});

const privateQuestionCategory = await call('create_question_category', {
  course_id: courseId,
  name: 'MoodlIA Quiz Private Questions',
  bank_scope: 'quiz_private',
  quiz_module_id: quizModule.course_module_id,
  description: 'Questions generated in the quiz-private question bank.'
});

const shortAnswerQuestion = await call('create_question', {
  category_id: privateQuestionCategory.category_id,
      context_id: privateQuestionCategory.context_id,
  question_type: 'shortanswer',
  name: 'MoodlIA Private Short Answer Question',
  question_text: '<p>Write the project name.</p>',
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
        feedback: 'Accepted with partial credit.'
      }
    ],
    case_sensitive: false
  })
});

const trueFalseQuizSlot = await call('add_question_to_quiz', {
  quiz_module_id: quizModule.course_module_id,
  question_id: trueFalseQuestion.question_id
});

const multichoiceQuizSlot = await call('add_question_to_quiz', {
  quiz_module_id: quizModule.course_module_id,
  question_id: multichoiceQuestion.question_id
});

const numericalQuizSlot = await call('add_question_to_quiz', {
  quiz_module_id: quizModule.course_module_id,
  question_id: numericalQuestion.question_id
});

const essayQuizSlot = await call('add_question_to_quiz', {
  quiz_module_id: quizModule.course_module_id,
  question_id: essayQuestion.question_id
});

const shortAnswerQuizSlot = await call('add_question_to_quiz', {
  quiz_module_id: quizModule.course_module_id,
  question_id: shortAnswerQuestion.question_id
});

const listedQuizQuestions = await call('get_quiz_questions', {
  quiz_module_id: quizModule.course_module_id
});

const startedQuizAttempt = await call('start_quiz_attempt', {
  quiz_module_id: quizModule.course_module_id
});

const listedQuizAttempts = await call('get_quiz_attempts', {
  quiz_module_id: quizModule.course_module_id,
  user_id: currentUser.id,
  status: 'all',
  include_previews: 1
});

const listedQuestionBanks = await call('get_question_banks', {
  course_id: courseId
});

const listedSharedCategories = await call('get_question_categories', {
  course_id: courseId,
  bank_scope: 'course_shared',
  question_bank_module_id: questionCategory.question_bank_module_id
});

const listedPrivateCategories = await call('get_question_categories', {
  course_id: courseId,
  bank_scope: 'quiz_private',
  quiz_module_id: quizModule.course_module_id
});

const questionBankMapPage = await call('create_module', {
  course_id: courseId,
  section_number: createdSection.section_number,
  module_type: 'page',
  name: 'MoodlIA Question Bank Map',
  options: JSON.stringify({
    content: [
      '<h3>MoodlIA question bank map</h3>',
      '<p>Use these direct links to verify where each generated question lives.</p>',
      '<ul>',
      `<li><a href="/question/edit.php?cmid=${questionCategory.question_bank_module_id}&category=${questionCategory.category_id},${questionCategory.context_id}">Course shared question bank: MoodlIA Generated Questions</a></li>`,
      `<li><a href="/question/edit.php?cmid=${quizModule.course_module_id}&category=${privateQuestionCategory.category_id},${privateQuestionCategory.context_id}">Quiz private question bank: MoodlIA Quiz Private Questions</a></li>`,
      `<li><a href="/mod/quiz/edit.php?cmid=${quizModule.course_module_id}">Quiz questions page: questions used by the quiz</a></li>`,
      '</ul>',
      '<p>The shared bank contains the true/false, multiple-choice, numerical, and essay questions. The quiz-private bank contains the short-answer question.</p>',
      '<p>The quiz questions page shows all questions used by the quiz, even when a question is stored in the course shared bank.</p>'
    ].join('')
  })
});

const listedCourseContents = await call('get_course_contents', {
  course_id: courseId
});

const afterCourses = normalizeCourses(await call('get_courses'));

console.log(JSON.stringify({
  reset_courses: resetCourses,
  deleted_courses: deletedCourses,
  delete_failures: deleteFailures,
  course_category: {
    created: updatedCourseCategory,
    listing: listedCourseCategories
  },
  created_course: createdCourse,
  cleared_course_defaults: clearedCourseDefaults,
  calendar: {
    event: calendarEvent,
    listing: listedCalendarEvents
  },
  participants: {
    current_user: currentUser,
    enrolled: enrolledUser,
    listing: enrolledUsers
  },
  groups: {
    created: group,
    member: groupMember,
    listing: listedGroups,
    members: listedGroupMembers
  },
  section: updatedSection,
  moved_section: movedContentSection,
  modules: {
    subsection: subsectionModule,
    subsection_details: subsectionDetails,
    qbank: qbankModule,
    qbank_details: qbankDetails,
    page: visiblePageModule,
    page_created: pageModule,
    page_hidden: hiddenPageModule,
    page_duplicate_created: duplicatedPageModule,
    page_duplicate: movedDuplicatedPageModule,
    assign: assignModule,
    assignment_submission: assignmentSubmission,
    submitted_assignment: submittedAssignment,
    graded_assignment: gradedAssignment,
    grade_items: gradeItems,
    user_grades: userGrades,
    book: bookModule,
    book_view: viewedBook,
    label: labelModule,
    url: urlModule,
    lti: ltiModule,
    lti_details: ltiDetails,
    data: dataModule,
    data_fields: {
      title: dataTitleField,
      status: dataStatusField,
      notes: dataNotesField,
      temporary_created: dataTemporaryField,
      temporary_updated: updatedDataTemporaryField,
      temporary_deleted: deletedDataTemporaryField,
      listing: listedDataFields
    },
    data_entries: {
      created: dataEntry,
      updated: updatedDataEntry,
      listing: listedDataEntries
    },
    data_details: dataDetails,
    lesson: lessonModule,
    lesson_access_information: lessonAccessInformation,
    lesson_pages: lessonPages,
    lesson_view: viewedLesson,
    lesson_user_grade: lessonUserGrade,
    lesson_user_timers: lessonUserTimers,
    lesson_attempts_overview: lessonAttemptsOverview,
    choice: choiceModule,
    choice_options: choiceOptions,
    submitted_choice_response: submittedChoiceResponse,
    choice_results: choiceResults,
    forum: forumModule,
    forum_discussion: forumDiscussion,
    forum_reply: updatedForumReply,
    forum_posts: forumPosts,
    glossary: glossaryModule,
    glossary_entry: updatedGlossaryEntry,
    glossary_entry_created: glossaryEntry,
    glossary_search: searchedGlossaryEntries,
    glossary_updated_search: searchedUpdatedGlossaryEntries,
    wiki: wikiModule,
    wiki_page_created: wikiPage,
    wiki_page: updatedWikiPage,
    wiki_pages: listedWikiPages,
    wiki_updated_pages: listedUpdatedWikiPages,
    workshop: workshopModule,
    workshop_phase: workshopSubmissionPhase,
    workshop_user_plan: workshopUserPlan,
    workshop_grades: workshopGrades,
    workshop_grades_report: workshopGradesReport,
    workshop_submission_created: workshopSubmission,
    workshop_submission: updatedWorkshopSubmission,
    workshop_submissions: listedWorkshopSubmissions,
    question_bank_map: questionBankMapPage,
    folder: folderModule,
    resource: resourceModule,
    quiz: quizModule
  },
  course_contents: listedCourseContents,
  file: {
    uploaded: uploadedFile,
    downloaded: downloadedFile,
    folder_listing: listedFolderFiles,
    resource_listing: listedResourceFiles,
    resource_downloaded: downloadedResourceFile
  },
  question_categories: {
    main: questionCategory,
    secondary: secondaryQuestionCategory,
    quiz_private: privateQuestionCategory
  },
  question_bank_listing: {
    banks: listedQuestionBanks,
    shared_categories: listedSharedCategories,
    private_categories: listedPrivateCategories
  },
  questions: {
    truefalse: trueFalseQuestion,
    multichoice: multichoiceQuestion,
    numerical: numericalQuestion,
    essay: essayQuestion,
    shortanswer: shortAnswerQuestion
  },
  quiz_slots: {
    truefalse: trueFalseQuizSlot,
    multichoice: multichoiceQuizSlot,
    numerical: numericalQuizSlot,
    essay: essayQuizSlot,
    shortanswer: shortAnswerQuizSlot,
    listing: listedQuizQuestions
  },
  quiz_attempts: {
    started: startedQuizAttempt,
    listing: listedQuizAttempts
  },
  remaining_courses: afterCourses
}, null, 2));
