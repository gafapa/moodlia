import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { fromRoot } from '../helpers/paths.mjs';

const pluginRoot = fromRoot('plugin/moodlia');

const requiredFiles = [
  'version.php',
  'mcp.php',
  'db/access.php',
  'db/services.php',
  'lang/en/local_moodlia.php',
  'classes/privacy/provider.php',
  'classes/operation/course_tools.php',
  'classes/operation/get_course_categories.php',
  'classes/operation/create_course_category.php',
  'classes/operation/update_course_category.php',
  'classes/operation/delete_course_category.php',
  'classes/operation/get_course_details.php',
  'classes/operation/create_course.php',
  'classes/operation/update_course.php',
  'classes/operation/delete_course.php',
  'classes/operation/get_course_contents.php',
  'classes/operation/get_module_details.php',
  'classes/operation/enrolment_tools.php',
  'classes/operation/get_enrolled_users.php',
  'classes/operation/enrol_user.php',
  'classes/operation/unenrol_user.php',
  'classes/operation/gradebook_tools.php',
  'classes/operation/get_grade_items.php',
  'classes/operation/get_user_grades.php',
  'classes/operation/get_course_progress_report.php',
  'classes/operation/group_tools.php',
  'classes/operation/get_groups.php',
  'classes/operation/create_group.php',
  'classes/operation/update_group.php',
  'classes/operation/delete_group.php',
  'classes/operation/get_groupings.php',
  'classes/operation/create_grouping.php',
  'classes/operation/update_grouping.php',
  'classes/operation/delete_grouping.php',
  'classes/operation/add_group_to_grouping.php',
  'classes/operation/remove_group_from_grouping.php',
  'classes/operation/get_group_members.php',
  'classes/operation/add_group_member.php',
  'classes/operation/remove_group_member.php',
  'classes/operation/get_current_user.php',
  'classes/operation/get_courses.php',
  'classes/operation/calendar_tools.php',
  'classes/operation/get_calendar_events.php',
  'classes/operation/create_calendar_event.php',
  'classes/operation/update_calendar_event.php',
  'classes/operation/delete_calendar_event.php',
  'classes/operation/forum_tools.php',
  'classes/operation/get_course_forums.php',
  'classes/operation/view_forum.php',
  'classes/operation/get_forum_discussions.php',
  'classes/operation/create_forum_discussion.php',
  'classes/operation/get_forum_discussion_posts.php',
  'classes/operation/create_forum_discussion_post.php',
  'classes/operation/update_forum_discussion_post.php',
  'classes/operation/set_forum_discussion_pin.php',
  'classes/operation/set_forum_discussion_favourite.php',
  'classes/operation/set_forum_discussion_subscription.php',
  'classes/operation/set_forum_discussion_lock.php',
  'classes/operation/delete_forum_discussion_post.php',
  'classes/operation/assignment_tools.php',
  'classes/operation/get_course_assignments.php',
  'classes/operation/get_assignment_submission_status.php',
  'classes/operation/save_assignment_submission.php',
  'classes/operation/submit_assignment_for_grading.php',
  'classes/operation/save_assignment_grade.php',
  'classes/operation/get_assignment_submissions.php',
  'classes/operation/get_assignment_grades.php',
  'classes/operation/view_assignment.php',
  'classes/operation/view_assignment_submission_status.php',
  'classes/operation/view_assignment_grading_table.php',
  'classes/operation/section_tools.php',
  'classes/operation/create_section.php',
  'classes/operation/update_section.php',
  'classes/operation/delete_section.php',
  'classes/operation/choice_tools.php',
  'classes/operation/get_choice_options.php',
  'classes/operation/get_course_choices.php',
  'classes/operation/view_choice.php',
  'classes/operation/submit_choice_response.php',
  'classes/operation/delete_choice_responses.php',
  'classes/operation/get_choice_results.php',
  'classes/operation/feedback_tools.php',
  'classes/operation/get_course_feedbacks.php',
  'classes/operation/view_feedback.php',
  'classes/operation/get_feedback_access_information.php',
  'classes/operation/get_feedback_items.php',
  'classes/operation/get_feedback_page_items.php',
  'classes/operation/get_feedback_analysis.php',
  'classes/operation/get_feedback_finished_responses.php',
  'classes/operation/delete_feedback_item.php',
  'classes/operation/book_tools.php',
  'classes/operation/get_course_books.php',
  'classes/operation/get_book_chapters.php',
  'classes/operation/view_book.php',
  'classes/operation/lesson_tools.php',
  'classes/operation/get_lesson_access_information.php',
  'classes/operation/get_lesson_details.php',
  'classes/operation/get_course_lessons.php',
  'classes/operation/get_lesson_pages.php',
  'classes/operation/view_lesson.php',
  'classes/operation/get_lesson_user_grade.php',
  'classes/operation/get_lesson_user_timers.php',
  'classes/operation/get_lesson_possible_jumps.php',
  'classes/operation/get_lesson_attempts_overview.php',
  'classes/operation/data_tools.php',
  'classes/operation/get_data_fields.php',
  'classes/operation/create_data_field.php',
  'classes/operation/update_data_field.php',
  'classes/operation/delete_data_field.php',
  'classes/operation/get_data_entries.php',
  'classes/operation/create_data_entry.php',
  'classes/operation/update_data_entry.php',
  'classes/operation/delete_data_entry.php',
  'classes/operation/module_tools.php',
  'classes/operation/module_lookup_tools.php',
  'classes/operation/module_common_tools.php',
  'classes/operation/module_content_tools.php',
  'classes/operation/module_assignment_tools.php',
  'classes/operation/module_quiz_tools.php',
  'classes/operation/module_interaction_tools.php',
  'classes/operation/module_advanced_tools.php',
  'classes/operation/create_module.php',
  'classes/operation/update_module.php',
  'classes/operation/duplicate_module.php',
  'classes/operation/move_module.php',
  'classes/operation/delete_module.php',
  'classes/operation/glossary_tools.php',
  'classes/operation/create_glossary_entry.php',
  'classes/operation/get_course_glossaries.php',
  'classes/operation/view_glossary.php',
  'classes/operation/view_glossary_entry.php',
  'classes/operation/get_glossary_entry.php',
  'classes/operation/get_glossary_entries_by_letter.php',
  'classes/operation/get_glossary_entries_by_category.php',
  'classes/operation/get_glossary_entries_by_author.php',
  'classes/operation/get_glossary_entries_by_author_id.php',
  'classes/operation/get_glossary_entries_by_date.php',
  'classes/operation/get_glossary_entries_by_term.php',
  'classes/operation/get_glossary_categories.php',
  'classes/operation/get_glossary_authors.php',
  'classes/operation/search_glossary_entries.php',
  'classes/operation/get_glossary_entries_to_approve.php',
  'classes/operation/update_glossary_entry.php',
  'classes/operation/delete_glossary_entry.php',
  'classes/operation/wiki_tools.php',
  'classes/operation/create_wiki_page.php',
  'classes/operation/get_wiki_pages.php',
  'classes/operation/get_wiki_subwikis.php',
  'classes/operation/get_wiki_files.php',
  'classes/operation/view_wiki.php',
  'classes/operation/view_wiki_page.php',
  'classes/operation/update_wiki_page.php',
  'classes/operation/delete_wiki_page.php',
  'classes/operation/upload_folder_file.php',
  'classes/operation/get_folder_files.php',
  'classes/operation/download_folder_file.php',
  'classes/operation/get_resource_files.php',
  'classes/operation/download_resource_file.php',
  'classes/operation/delete_folder_file.php',
  'classes/operation/question_tools.php',
  'classes/operation/get_question_banks.php',
  'classes/operation/get_question_categories.php',
  'classes/operation/create_question_category.php',
  'classes/operation/update_question_category.php',
  'classes/operation/delete_question_category.php',
  'classes/operation/create_question.php',
  'classes/operation/get_questions.php',
  'classes/operation/update_question.php',
  'classes/operation/move_question.php',
  'classes/operation/delete_question.php',
  'classes/operation/get_quiz_questions.php',
  'classes/operation/get_course_quizzes.php',
  'classes/operation/start_quiz_attempt.php',
  'classes/operation/get_quiz_attempts.php',
  'classes/operation/get_quiz_results_report.php',
  'classes/operation/get_quiz_attempt_access_information.php',
  'classes/operation/get_quiz_attempt_data.php',
  'classes/operation/get_quiz_attempt_summary.php',
  'classes/operation/save_quiz_attempt.php',
  'classes/operation/process_quiz_attempt.php',
  'classes/operation/get_quiz_attempt_review.php',
  'classes/operation/get_quiz_access_information.php',
  'classes/operation/get_quiz_combined_review_options.php',
  'classes/operation/view_quiz.php',
  'classes/operation/view_quiz_attempt.php',
  'classes/operation/view_quiz_attempt_summary.php',
  'classes/operation/view_quiz_attempt_review.php',
  'classes/operation/get_quiz_user_best_grade.php',
  'classes/operation/get_quiz_feedback_for_grade.php',
  'classes/operation/get_quiz_required_question_types.php',
  'classes/operation/add_question_to_quiz.php',
  'classes/operation/add_random_questions_to_quiz.php',
  'classes/operation/update_quiz_question_slot.php',
  'classes/operation/remove_question_from_quiz.php',
  'classes/operation/workshop_tools.php',
  'classes/operation/set_workshop_phase.php',
  'classes/operation/get_workshop_submissions.php',
  'classes/operation/get_workshop_user_plan.php',
  'classes/operation/get_workshop_grades.php',
  'classes/operation/get_workshop_grades_report.php',
  'classes/operation/get_workshop_reviewer_assessments.php',
  'classes/operation/get_workshop_submission_assessments.php',
  'classes/operation/create_workshop_submission.php',
  'classes/operation/update_workshop_submission.php',
  'classes/operation/delete_workshop_submission.php',
  'classes/mcp/manifest.php',
  'classes/external/create_course.php',
  'classes/external/get_course_categories.php',
  'classes/external/create_course_category.php',
  'classes/external/update_course_category.php',
  'classes/external/delete_course_category.php',
  'classes/external/get_course_details.php',
  'classes/external/update_course.php',
  'classes/external/delete_course.php',
  'classes/external/get_course_contents.php',
  'classes/external/get_module_details.php',
  'classes/external/get_enrolled_users.php',
  'classes/external/enrol_user.php',
  'classes/external/unenrol_user.php',
  'classes/external/get_grade_items.php',
  'classes/external/get_user_grades.php',
  'classes/external/get_course_progress_report.php',
  'classes/external/get_groups.php',
  'classes/external/create_group.php',
  'classes/external/update_group.php',
  'classes/external/delete_group.php',
  'classes/external/get_groupings.php',
  'classes/external/create_grouping.php',
  'classes/external/update_grouping.php',
  'classes/external/delete_grouping.php',
  'classes/external/add_group_to_grouping.php',
  'classes/external/remove_group_from_grouping.php',
  'classes/external/get_group_members.php',
  'classes/external/add_group_member.php',
  'classes/external/remove_group_member.php',
  'classes/external/get_current_user.php',
  'classes/external/get_courses.php',
  'classes/external/get_calendar_events.php',
  'classes/external/create_calendar_event.php',
  'classes/external/update_calendar_event.php',
  'classes/external/delete_calendar_event.php',
  'classes/external/get_course_forums.php',
  'classes/external/view_forum.php',
  'classes/external/get_forum_discussions.php',
  'classes/external/create_forum_discussion.php',
  'classes/external/get_forum_discussion_posts.php',
  'classes/external/create_forum_discussion_post.php',
  'classes/external/update_forum_discussion_post.php',
  'classes/external/set_forum_discussion_pin.php',
  'classes/external/set_forum_discussion_favourite.php',
  'classes/external/set_forum_discussion_subscription.php',
  'classes/external/set_forum_discussion_lock.php',
  'classes/external/delete_forum_discussion_post.php',
  'classes/external/get_course_assignments.php',
  'classes/external/get_assignment_submission_status.php',
  'classes/external/save_assignment_submission.php',
  'classes/external/submit_assignment_for_grading.php',
  'classes/external/save_assignment_grade.php',
  'classes/external/get_assignment_submissions.php',
  'classes/external/get_assignment_grades.php',
  'classes/external/view_assignment.php',
  'classes/external/view_assignment_submission_status.php',
  'classes/external/view_assignment_grading_table.php',
  'classes/external/create_section.php',
  'classes/external/update_section.php',
  'classes/external/delete_section.php',
  'classes/external/get_choice_options.php',
  'classes/external/get_course_choices.php',
  'classes/external/view_choice.php',
  'classes/external/submit_choice_response.php',
  'classes/external/delete_choice_responses.php',
  'classes/external/get_choice_results.php',
  'classes/external/get_course_feedbacks.php',
  'classes/external/view_feedback.php',
  'classes/external/get_feedback_access_information.php',
  'classes/external/get_feedback_items.php',
  'classes/external/get_feedback_page_items.php',
  'classes/external/get_feedback_analysis.php',
  'classes/external/get_feedback_finished_responses.php',
  'classes/external/delete_feedback_item.php',
  'classes/external/get_course_books.php',
  'classes/external/get_book_chapters.php',
  'classes/external/view_book.php',
  'classes/external/get_lesson_access_information.php',
  'classes/external/get_lesson_details.php',
  'classes/external/get_course_lessons.php',
  'classes/external/get_lesson_pages.php',
  'classes/external/view_lesson.php',
  'classes/external/get_lesson_user_grade.php',
  'classes/external/get_lesson_user_timers.php',
  'classes/external/get_lesson_possible_jumps.php',
  'classes/external/get_lesson_attempts_overview.php',
  'classes/external/get_data_fields.php',
  'classes/external/create_data_field.php',
  'classes/external/update_data_field.php',
  'classes/external/delete_data_field.php',
  'classes/external/get_data_entries.php',
  'classes/external/create_data_entry.php',
  'classes/external/update_data_entry.php',
  'classes/external/delete_data_entry.php',
  'classes/external/create_module.php',
  'classes/external/update_module.php',
  'classes/external/duplicate_module.php',
  'classes/external/move_module.php',
  'classes/external/delete_module.php',
  'classes/external/create_glossary_entry.php',
  'classes/external/get_course_glossaries.php',
  'classes/external/view_glossary.php',
  'classes/external/view_glossary_entry.php',
  'classes/external/get_glossary_entry.php',
  'classes/external/get_glossary_entries_by_letter.php',
  'classes/external/get_glossary_entries_by_category.php',
  'classes/external/get_glossary_entries_by_author.php',
  'classes/external/get_glossary_entries_by_author_id.php',
  'classes/external/get_glossary_entries_by_date.php',
  'classes/external/get_glossary_entries_by_term.php',
  'classes/external/get_glossary_categories.php',
  'classes/external/get_glossary_authors.php',
  'classes/external/search_glossary_entries.php',
  'classes/external/get_glossary_entries_to_approve.php',
  'classes/external/update_glossary_entry.php',
  'classes/external/delete_glossary_entry.php',
  'classes/external/create_wiki_page.php',
  'classes/external/get_wiki_pages.php',
  'classes/external/get_wiki_subwikis.php',
  'classes/external/get_wiki_files.php',
  'classes/external/view_wiki.php',
  'classes/external/view_wiki_page.php',
  'classes/external/update_wiki_page.php',
  'classes/external/delete_wiki_page.php',
  'classes/external/upload_folder_file.php',
  'classes/external/get_folder_files.php',
  'classes/external/download_folder_file.php',
  'classes/external/get_resource_files.php',
  'classes/external/download_resource_file.php',
  'classes/external/delete_folder_file.php',
  'classes/external/get_question_banks.php',
  'classes/external/get_question_categories.php',
  'classes/external/create_question_category.php',
  'classes/external/update_question_category.php',
  'classes/external/delete_question_category.php',
  'classes/external/create_question.php',
  'classes/external/get_questions.php',
  'classes/external/update_question.php',
  'classes/external/move_question.php',
  'classes/external/delete_question.php',
  'classes/external/get_quiz_questions.php',
  'classes/external/get_course_quizzes.php',
  'classes/external/start_quiz_attempt.php',
  'classes/external/get_quiz_attempts.php',
  'classes/external/get_quiz_results_report.php',
  'classes/external/get_quiz_attempt_access_information.php',
  'classes/external/get_quiz_attempt_data.php',
  'classes/external/get_quiz_attempt_summary.php',
  'classes/external/save_quiz_attempt.php',
  'classes/external/process_quiz_attempt.php',
  'classes/external/get_quiz_attempt_review.php',
  'classes/external/get_quiz_access_information.php',
  'classes/external/get_quiz_combined_review_options.php',
  'classes/external/view_quiz.php',
  'classes/external/view_quiz_attempt.php',
  'classes/external/view_quiz_attempt_summary.php',
  'classes/external/view_quiz_attempt_review.php',
  'classes/external/get_quiz_user_best_grade.php',
  'classes/external/get_quiz_feedback_for_grade.php',
  'classes/external/get_quiz_required_question_types.php',
  'classes/external/add_question_to_quiz.php',
  'classes/external/add_random_questions_to_quiz.php',
  'classes/external/update_quiz_question_slot.php',
  'classes/external/remove_question_from_quiz.php',
  'classes/external/set_workshop_phase.php',
  'classes/external/get_workshop_submissions.php',
  'classes/external/get_workshop_user_plan.php',
  'classes/external/get_workshop_grades.php',
  'classes/external/get_workshop_grades_report.php',
  'classes/external/get_workshop_reviewer_assessments.php',
  'classes/external/get_workshop_submission_assessments.php',
  'classes/external/create_workshop_submission.php',
  'classes/external/update_workshop_submission.php',
  'classes/external/delete_workshop_submission.php'
];

async function readPluginPhpFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = `${directory}/${entry.name}`;
    if (entry.isDirectory()) {
      files.push(...await readPluginPhpFiles(fullPath));
    } else if (entry.name.endsWith('.php')) {
      files.push(fullPath);
    }
  }

  return files;
}

test('Moodle plugin scaffold contains required files', async () => {
  for (const relativePath of requiredFiles) {
    const stats = await fs.stat(fromRoot('plugin/moodlia', relativePath));
    assert.ok(stats.isFile(), `${relativePath} must exist.`);
  }
});

test('plugin does not declare plugin-owned database schema files', async () => {
  await assert.rejects(
    fs.stat(fromRoot('plugin/moodlia/db/install.xml')),
    /ENOENT/,
    'db/install.xml must not exist.'
  );

  await assert.rejects(
    fs.stat(fromRoot('plugin/moodlia/db/upgrade.php')),
    /ENOENT/,
    'db/upgrade.php must not exist.'
  );
});

test('plugin code does not use direct database access or raw SQL', async () => {
  const files = await readPluginPhpFiles(pluginRoot.replaceAll('\\', '/'));
  const forbiddenPatterns = [
    /\$DB\b/,
    /\bSELECT\b[\s\S]*\bFROM\b/i,
    /\bINSERT\s+INTO\b/i,
    /\bUPDATE\s+\S+\s+SET\b/i,
    /\bDELETE\s+FROM\b/i
  ];

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    for (const pattern of forbiddenPatterns) {
      assert.doesNotMatch(content, pattern, `${file} must not contain ${pattern}.`);
    }
  }
});

test('module File API responsibilities stay isolated from module configuration tools', async () => {
  const moduleTools = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/module_tools.php'), 'utf8');
  const moduleFileTools = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/module_file_tools.php'), 'utf8');
  const fileApiMarkers = [
    'get_file_storage(',
    'make_pluginfile_url(',
    'get_area_files(',
    'get_file_by_id(',
    "'mod_folder'",
    "'mod_resource'"
  ];

  for (const marker of fileApiMarkers) {
    assert.ok(moduleFileTools.includes(marker), `module_file_tools.php must own File API marker ${marker}.`);
    assert.ok(!moduleTools.includes(marker), `module_tools.php must not own File API marker ${marker}.`);
  }

  assert.match(moduleFileTools, /class\s+module_file_tools\b/);
  assert.ok(moduleFileTools.includes('module_tools::get_course_module('));
});

test('common module settings stay isolated from module activity tools', async () => {
  const moduleTools = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/module_tools.php'), 'utf8');
  const moduleCommonTools = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/module_common_tools.php'), 'utf8');
  const commonMarkers = [
    'normalise_group_mode',
    'normalise_availability',
    'normalise_tags',
    'set_coursemodule_idnumber',
    'set_downloadcontent(',
    'set_item_tags('
  ];

  assert.match(moduleCommonTools, /class\s+module_common_tools\b/);
  assert.ok(moduleTools.includes('module_common_tools::apply_create_options('));
  assert.ok(moduleTools.includes('module_common_tools::apply_update_options('));
  assert.ok(moduleTools.includes('module_common_tools::is_visible_on_course_page('));

  for (const marker of commonMarkers) {
    assert.ok(moduleCommonTools.includes(marker), `module_common_tools.php must own common module marker ${marker}.`);
    assert.ok(!moduleTools.includes(marker), `module_tools.php must not own common module marker ${marker}.`);
  }
});

test('module lookup responsibilities stay isolated from module activity tools', async () => {
  const moduleTools = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/module_tools.php'), 'utf8');
  const moduleLookupTools = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/module_lookup_tools.php'), 'utf8');
  const lookupMarkers = [
    'content_item_service_factory',
    'get_content_item_service',
    'get_fast_modinfo(',
    'rebuild_course_cache(',
    'moduledisable',
    'invalidcoursemodule'
  ];

  assert.match(moduleLookupTools, /class\s+module_lookup_tools\b/);
  assert.ok(moduleTools.includes('module_lookup_tools::require_module_api('));
  assert.ok(moduleTools.includes('module_lookup_tools::resolve_content_item_id('));
  assert.ok(moduleTools.includes('module_lookup_tools::get_course_module('));
  assert.ok(moduleTools.includes('module_lookup_tools::to_response('));
  assert.ok(moduleTools.includes('module_lookup_tools::get_quiz_module('));

  for (const marker of lookupMarkers) {
    assert.ok(moduleLookupTools.includes(marker), `module_lookup_tools.php must own module lookup marker ${marker}.`);
    assert.ok(!moduleTools.includes(marker), `module_tools.php must not own module lookup marker ${marker}.`);
  }
});

test('simple content module settings stay isolated from module activity tools', async () => {
  const moduleTools = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/module_tools.php'), 'utf8');
  const moduleContentTools = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/module_content_tools.php'), 'utf8');
  const contentMarkers = [
    'normalise_resource_display',
    'normalise_folder_display',
    'normalise_filter_files',
    'BOOK_NUM_',
    'FOLDER_DISPLAY_',
    'create_resource_draft_file',
    'options.external_url is required for url modules',
    'options.content is required for label modules'
  ];

  assert.match(moduleContentTools, /class\s+module_content_tools\b/);
  for (const method of [
    'apply_page_options',
    'apply_qbank_options',
    'apply_book_options',
    'apply_folder_options',
    'apply_label_options',
    'apply_resource_options',
    'apply_subsection_options',
    'apply_url_options'
  ]) {
    assert.ok(
      moduleTools.includes(`module_content_tools::${method}(`),
      `module_tools.php must delegate ${method} to module_content_tools.php.`
    );
  }

  for (const marker of contentMarkers) {
    assert.ok(moduleContentTools.includes(marker), `module_content_tools.php must own content marker ${marker}.`);
    assert.ok(!moduleTools.includes(marker), `module_tools.php must not own content marker ${marker}.`);
  }
});

test('assignment module settings stay isolated from module activity tools', async () => {
  const moduleTools = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/module_tools.php'), 'utf8');
  const moduleAssignmentTools = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/module_assignment_tools.php'), 'utf8');
  const assignmentMarkers = [
    'normalise_assign_max_attempts',
    'normalise_assign_reopen_method',
    'validate_assign_dates',
    'allowsubmissionsfromdate',
    'attemptreopenmethod',
    'assignsubmission_',
    'assignfeedback_'
  ];

  assert.match(moduleAssignmentTools, /class\s+module_assignment_tools\b/);
  assert.ok(moduleTools.includes('module_assignment_tools::apply_assign_options('));

  for (const marker of assignmentMarkers) {
    assert.ok(moduleAssignmentTools.includes(marker), `module_assignment_tools.php must own assignment marker ${marker}.`);
    assert.ok(!moduleTools.includes(marker), `module_tools.php must not own assignment marker ${marker}.`);
  }
});

test('quiz module settings stay isolated from module activity tools', async () => {
  const moduleTools = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/module_tools.php'), 'utf8');
  const moduleQuizTools = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/module_quiz_tools.php'), 'utf8');
  const quizMarkers = [
    'normalise_quiz_',
    'normalise_decimal_points',
    'reviewattempt',
    'preferredbehaviour',
    'overduehandling',
    'quizpassword'
  ];

  assert.match(moduleQuizTools, /class\s+module_quiz_tools\b/);
  assert.ok(moduleTools.includes('module_quiz_tools::apply_quiz_options('));

  for (const marker of quizMarkers) {
    assert.ok(moduleQuizTools.includes(marker), `module_quiz_tools.php must own quiz marker ${marker}.`);
    assert.ok(!moduleTools.includes(marker), `module_tools.php must not own quiz marker ${marker}.`);
  }
});

test('interaction module settings stay isolated from module activity tools', async () => {
  const moduleTools = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/module_tools.php'), 'utf8');
  const moduleInteractionTools = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/module_interaction_tools.php'), 'utf8');
  const interactionMarkers = [
    'normalise_choice_',
    'normalise_feedback_anonymous',
    'normalise_data_sort_direction',
    'normalise_forum_',
    'validate_forum_',
    'CHOICE_',
    'FORUM_',
    "get_list_of_plugins('mod/glossary/formats'",
    'wiki_get_formats'
  ];

  assert.match(moduleInteractionTools, /class\s+module_interaction_tools\b/);
  for (const method of [
    'apply_choice_options',
    'apply_feedback_options',
    'apply_data_options',
    'apply_forum_options',
    'apply_glossary_options',
    'apply_wiki_options'
  ]) {
    assert.ok(
      moduleTools.includes(`module_interaction_tools::${method}(`),
      `module_tools.php must delegate ${method} to module_interaction_tools.php.`
    );
  }

  for (const marker of interactionMarkers) {
    assert.ok(moduleInteractionTools.includes(marker), `module_interaction_tools.php must own interaction marker ${marker}.`);
    assert.ok(!moduleTools.includes(marker), `module_tools.php must not own interaction marker ${marker}.`);
  }
});

test('advanced module settings stay isolated from module activity tools', async () => {
  const moduleTools = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/module_tools.php'), 'utf8');
  const moduleAdvancedTools = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/module_advanced_tools.php'), 'utf8');
  const advancedMarkers = [
    'normalise_absolute_http_url',
    'normalise_lesson_next_page',
    'normalise_hex_colour',
    'normalise_workshop_',
    'normalise_lti_',
    'lti_setting_from_bool',
    'WORKSHOP_',
    'LTI_',
    'LESSON_',
    'slideshow_background',
    'tool_url',
    'submission_instructions'
  ];

  assert.match(moduleAdvancedTools, /class\s+module_advanced_tools\b/);
  for (const method of [
    'apply_lesson_options',
    'apply_workshop_options',
    'apply_lti_options'
  ]) {
    assert.ok(
      moduleTools.includes(`module_advanced_tools::${method}(`),
      `module_tools.php must delegate ${method} to module_advanced_tools.php.`
    );
  }

  for (const marker of advancedMarkers) {
    assert.ok(moduleAdvancedTools.includes(marker), `module_advanced_tools.php must own advanced marker ${marker}.`);
    assert.ok(!moduleTools.includes(marker), `module_tools.php must not own advanced marker ${marker}.`);
  }
});

test('write external functions validate context and declared capabilities before dispatch', async () => {
  const contract = JSON.parse(await fs.readFile(fromRoot('contract/operations.json'), 'utf8'));
  const helperCapabilities = new Map([
    ['save_quiz_attempt', ['mod/quiz:attempt', 'mod/quiz:preview']],
    ['process_quiz_attempt', ['mod/quiz:attempt', 'mod/quiz:preview']],
    ['view_quiz_attempt', ['mod/quiz:attempt', 'mod/quiz:preview']],
    ['view_quiz_attempt_summary', ['mod/quiz:attempt', 'mod/quiz:preview']],
    ['view_quiz_attempt_review', ['mod/quiz:attempt', 'mod/quiz:preview', 'mod/quiz:viewreports']],
    ['update_question', ['moodle/question:editmine', 'moodle/question:editall']],
    ['delete_question', ['moodle/question:editmine', 'moodle/question:editall']],
    ['move_question', ['moodle/question:movemine', 'moodle/question:moveall']]
  ]);

  const contextHelpers = [
    'require_assignment_context(',
    'validate_quiz_attempt_context(',
    'validate_quiz_attempt_review_context('
  ];

  for (const operation of contract.operations.filter((item) => item.type === 'write' && item.transports.includes('rest'))) {
    const externalPath = fromRoot('plugin/moodlia/classes/external', `${operation.name}.php`);
    const content = await fs.readFile(externalPath, 'utf8');
    const usesSharedContextHelper = contextHelpers.some((helper) => content.includes(helper));
    const helperCaps = helperCapabilities.get(operation.name) ?? [];

    assert.ok(
      content.includes('validate_context(') || usesSharedContextHelper,
      `${operation.name} must validate a Moodle context before dispatch.`
    );
    assert.ok(
      content.includes('local/moodlia:useapi') || usesSharedContextHelper,
      `${operation.name} must require local/moodlia:useapi before dispatch.`
    );

    for (const capability of operation.capabilities) {
      assert.ok(
        content.includes(capability) || helperCaps.includes(capability),
        `${operation.name} must enforce ${capability} before dispatch.`
      );
    }
  }
});

test('calculated question distribution accepts only v1 contract names', async () => {
  const questionTools = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/question_tools.php'), 'utf8');

  assert.match(questionTools, /'uniform'\s*=>\s*'uniform'/);
  assert.match(questionTools, /'loguniform'\s*=>\s*'loguniform'/);
  assert.doesNotMatch(questionTools, /'0'\s*=>\s*'uniform'/);
  assert.doesNotMatch(questionTools, /'1'\s*=>\s*'loguniform'/);
  assert.doesNotMatch(questionTools, /compatibility aliases/);
});

test('create_module exposes audited common Moodle module options', async () => {
  const contract = JSON.parse(await fs.readFile(fromRoot('contract/operations.json'), 'utf8'));
  const createModule = contract.operations.find((operation) => operation.name === 'create_module');
  const updateModule = contract.operations.find((operation) => operation.name === 'update_module');
  const commonProperties = createModule.parameters.options.common_properties;
  const expectedOptions = [
    'visible',
    'visible_on_course_page',
    'show_description',
    'id_number',
    'language',
    'group_mode',
    'grouping_id',
    'availability',
    'tags',
    'download_content',
    'completion_tracking',
    'completion_view_required',
    'completion_grade_item_number',
    'completion_expected'
  ];

  for (const option of expectedOptions) {
    assert.ok(commonProperties[option], `create_module options must document ${option}.`);
  }

  const moduleProperties = createModule.parameters.options.module_properties;
  const expectedModuleOptions = {
    assign: ['activity', 'submission_attachments', 'submission_drafts', 'require_submission_statement', 'send_notifications', 'send_late_notifications', 'send_student_notifications', 'allow_submissions_from_date', 'due_date', 'cutoff_date', 'grading_due_date', 'grade', 'team_submission', 'require_all_team_members_submit', 'team_submission_grouping_id', 'prevent_submission_not_in_group', 'blind_marking', 'hide_grader', 'max_attempts', 'attempt_reopen_method', 'marking_workflow', 'marking_allocation', 'marking_anonymous', 'marker_count', 'feedback_comments', 'feedback_comment_inline', 'feedback_offline', 'feedback_files', 'feedback_editpdf'],
    book: ['numbering', 'custom_titles'],
    choice: ['display', 'limit_answers', 'limits', 'show_available', 'show_preview', 'show_results', 'publish', 'show_unanswered', 'include_inactive', 'time_open', 'time_close'],
    data: ['comments', 'approval_required', 'manage_approved', 'required_entries', 'required_entries_to_view', 'max_entries', 'rss_articles', 'available_from', 'available_to', 'view_from', 'view_to', 'default_sort_field_id', 'default_sort_direction', 'edit_any', 'notification', 'completion_entries'],
    feedback: ['anonymous', 'multiple_submit', 'email_notification', 'autonumbering', 'publish_stats', 'page_after_submit', 'site_after_submit', 'completion_submit', 'time_open', 'time_close'],
    lesson: ['practice', 'allow_review', 'ongoing_score', 'progress_bar', 'display_left_menu', 'display_left_if', 'slideshow', 'max_answers', 'default_feedback', 'available_from', 'deadline', 'time_limit_seconds', 'use_password', 'password', 'allow_question_retry', 'max_attempts', 'after_correct_answer', 'pages_to_show', 'grade', 'custom_scoring', 'retakes_allowed', 'use_max_grade', 'minimum_questions', 'activity_link', 'allow_offline_attempts', 'completion_end_reached', 'completion_time_spent_seconds', 'media_height', 'media_width', 'media_close_button', 'slideshow_width', 'slideshow_height', 'slideshow_background'],
    lti: ['tool_url', 'secure_tool_url', 'type_id', 'launch_container', 'send_name', 'send_email', 'allow_roster', 'allow_setting', 'accept_grades', 'grade', 'custom_parameters', 'resource_key', 'shared_secret', 'debug_launch', 'show_title_launch', 'show_description_launch', 'icon', 'secure_icon'],
    folder: ['display', 'show_expanded', 'show_download_folder', 'force_download'],
    forum: ['forum_type', 'max_bytes', 'max_attachments', 'subscription_mode', 'tracking_type', 'display_word_count', 'lock_discussion_after_seconds', 'due_date', 'cutoff_date', 'warn_after_posts', 'block_after_posts', 'block_period_seconds', 'completion_discussions', 'completion_replies', 'completion_posts'],
    glossary: ['main_glossary', 'default_approval', 'edit_always', 'allow_duplicated_entries', 'allow_comments', 'use_dynamic_linking', 'display_format', 'approval_display_format', 'entries_per_page', 'show_alphabet', 'show_all', 'show_special', 'allow_print_view', 'completion_entries'],
    page: ['print_intro', 'print_last_modified'],
    qbank: [],
    quiz: ['time_open', 'time_close', 'time_limit_seconds', 'attempts', 'grade_method', 'questions_per_page', 'navigation_method', 'preferred_behaviour', 'shuffle_answers', 'attempt_on_last', 'decimal_points', 'question_decimal_points', 'show_user_picture', 'show_blocks', 'browser_security', 'allow_offline_attempts'],
    resource: ['popup_width', 'popup_height', 'filter_files'],
    subsection: [],
    url: ['popup_width', 'popup_height'],
    wiki: ['first_page_title', 'wiki_mode', 'default_format', 'force_format'],
    workshop: ['strategy', 'submission_grade', 'assessment_grade', 'grade_decimals', 'submission_instructions', 'assessment_instructions', 'text_submission', 'file_submission', 'max_submission_attachments', 'submission_file_types', 'max_file_size', 'late_submissions', 'self_assessment', 'example_submissions', 'examples_mode', 'submission_start', 'submission_end', 'assessment_start', 'assessment_end', 'switch_to_assessment_after_submission_deadline', 'conclusion', 'overall_feedback_mode', 'overall_feedback_files', 'overall_feedback_file_types', 'overall_feedback_max_file_size']
  };

  for (const [moduleType, options] of Object.entries(expectedModuleOptions)) {
    assert.ok(moduleProperties[moduleType], `create_module must document ${moduleType} options.`);
    for (const option of options) {
      assert.ok(moduleProperties[moduleType][option], `create_module ${moduleType} options must document ${option}.`);
    }
  }

  const expectedReturns = [
    'visible_on_course_page',
    'id_number',
    'language',
    'group_mode',
    'grouping_id',
    'availability',
    'download_content',
    'completion',
    'completion_view',
    'completion_grade_item_number',
    'completion_expected'
  ];
  for (const field of expectedReturns) {
    assert.ok(createModule.returns[field], `create_module returns must expose ${field}.`);
  }

  const moduleTools = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/module_tools.php'), 'utf8');
  assert.match(moduleTools, /function apply_common_options/, 'module_tools must apply common module options.');
  assert.match(moduleTools, /function apply_common_update_options/, 'module_tools must apply safe common module update options.');

  const updateProperties = updateModule.parameters.options.update_properties;
  for (const option of ['visible', 'visible_on_course_page', 'id_number', 'group_mode', 'tags', 'download_content', 'completion_tracking', 'completion_view_required', 'completion_grade_item_number', 'completion_expected', 'reset_completion_states']) {
    assert.ok(updateProperties[option], `update_module options must document ${option}.`);
  }
});
