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
  'classes/operation/move_course.php',
  'classes/operation/delete_course.php',
  'classes/operation/get_course_contents.php',
  'classes/operation/get_module_details.php',
  'classes/operation/admin_tools.php',
  'classes/operation/enrolment_tools.php',
  'classes/operation/get_enrolled_users.php',
  'classes/operation/get_user_details.php',
  'classes/operation/create_user.php',
  'classes/operation/update_user.php',
  'classes/operation/delete_user.php',
  'classes/operation/create_cohort.php',
  'classes/operation/update_cohort.php',
  'classes/operation/delete_cohort.php',
  'classes/operation/add_cohort_member.php',
  'classes/operation/remove_cohort_member.php',
  'classes/operation/assign_course_role.php',
  'classes/operation/unassign_course_role.php',
  'classes/operation/enrol_user.php',
  'classes/operation/unenrol_user.php',
  'classes/operation/gradebook_tools.php',
  'classes/operation/get_grade_items.php',
  'classes/operation/get_user_grades.php',
  'classes/operation/get_grade_categories.php',
  'classes/operation/create_grade_category.php',
  'classes/operation/update_grade_category.php',
  'classes/operation/delete_grade_category.php',
  'classes/operation/create_grade_item.php',
  'classes/operation/update_grade_item.php',
  'classes/operation/delete_grade_item.php',
  'classes/operation/update_grade_value.php',
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
  'classes/operation/get_moodlia_status.php',
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
  'classes/operation/assignment_grading_tools.php',
  'classes/operation/get_course_assignments.php',
  'classes/operation/get_assignment_submission_status.php',
  'classes/operation/save_assignment_submission.php',
  'classes/operation/submit_assignment_for_grading.php',
  'classes/operation/save_assignment_grade.php',
  'classes/operation/get_assignment_grading_form.php',
  'classes/operation/set_assignment_rubric.php',
  'classes/operation/set_assignment_checklist.php',
  'classes/operation/set_assignment_marking_guide.php',
  'classes/operation/grade_assignment_with_rubric.php',
  'classes/operation/grade_assignment_with_checklist.php',
  'classes/operation/grade_assignment_with_marking_guide.php',
  'classes/operation/get_assignment_submissions.php',
  'classes/operation/get_assignment_grades.php',
  'classes/operation/view_assignment.php',
  'classes/operation/view_assignment_submission_status.php',
  'classes/operation/view_assignment_grading_table.php',
  'classes/operation/course_backup_tools.php',
  'classes/operation/backup_course.php',
  'classes/operation/restore_course_backup.php',
  'classes/operation/upload_course_backup.php',
  'classes/operation/get_course_backup_files.php',
  'classes/operation/delete_course_backup_file.php',
  'classes/operation/completion_audit_tools.php',
  'classes/operation/audit_course_completion.php',
  'classes/operation/repair_course_completion.php',
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
  'classes/operation/book_chapter_tools.php',
  'classes/operation/get_course_books.php',
  'classes/operation/get_book_chapters.php',
  'classes/operation/view_book.php',
  'classes/operation/create_book_chapter.php',
  'classes/operation/update_book_chapter.php',
  'classes/operation/move_book_chapter.php',
  'classes/operation/delete_book_chapter.php',
  'classes/operation/lesson_tools.php',
  'classes/operation/get_lesson_access_information.php',
  'classes/operation/get_lesson_details.php',
  'classes/operation/get_course_lessons.php',
  'classes/operation/get_lesson_pages.php',
  'classes/operation/create_lesson_page.php',
  'classes/operation/update_lesson_page.php',
  'classes/operation/delete_lesson_page.php',
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
  'classes/operation/export_question_bank_blueprint.php',
  'classes/operation/import_question_bank_blueprint.php',
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
  'classes/operation/create_feedback_item.php',
  'classes/operation/update_feedback_item.php',
  'classes/operation/workshop_tools.php',
  'classes/operation/set_workshop_phase.php',
  'classes/operation/get_workshop_submissions.php',
  'classes/operation/get_workshop_user_plan.php',
  'classes/operation/get_workshop_grades.php',
  'classes/operation/get_workshop_grades_report.php',
  'classes/operation/get_workshop_reviewer_assessments.php',
  'classes/operation/get_workshop_submission_assessments.php',
  'classes/operation/set_workshop_grading_form.php',
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
  'classes/external/move_course.php',
  'classes/external/delete_course.php',
  'classes/external/get_course_contents.php',
  'classes/external/get_module_details.php',
  'classes/external/get_enrolled_users.php',
  'classes/external/admin_response.php',
  'classes/external/get_user_details.php',
  'classes/external/create_user.php',
  'classes/external/update_user.php',
  'classes/external/delete_user.php',
  'classes/external/create_cohort.php',
  'classes/external/update_cohort.php',
  'classes/external/delete_cohort.php',
  'classes/external/add_cohort_member.php',
  'classes/external/remove_cohort_member.php',
  'classes/external/assign_course_role.php',
  'classes/external/unassign_course_role.php',
  'classes/external/enrol_user.php',
  'classes/external/unenrol_user.php',
  'classes/external/get_grade_items.php',
  'classes/external/get_user_grades.php',
  'classes/external/gradebook_response.php',
  'classes/external/get_grade_categories.php',
  'classes/external/create_grade_category.php',
  'classes/external/update_grade_category.php',
  'classes/external/delete_grade_category.php',
  'classes/external/create_grade_item.php',
  'classes/external/update_grade_item.php',
  'classes/external/delete_grade_item.php',
  'classes/external/update_grade_value.php',
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
  'classes/external/get_moodlia_status.php',
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
  'classes/external/get_assignment_grading_form.php',
  'classes/external/set_assignment_rubric.php',
  'classes/external/set_assignment_checklist.php',
  'classes/external/set_assignment_marking_guide.php',
  'classes/external/grade_assignment_with_rubric.php',
  'classes/external/grade_assignment_with_checklist.php',
  'classes/external/grade_assignment_with_marking_guide.php',
  'classes/external/get_assignment_submissions.php',
  'classes/external/get_assignment_grades.php',
  'classes/external/view_assignment.php',
  'classes/external/view_assignment_submission_status.php',
  'classes/external/view_assignment_grading_table.php',
  'classes/external/backup_course.php',
  'classes/external/restore_course_backup.php',
  'classes/external/upload_course_backup.php',
  'classes/external/get_course_backup_files.php',
  'classes/external/delete_course_backup_file.php',
  'classes/external/audit_course_completion.php',
  'classes/external/repair_course_completion.php',
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
  'classes/external/create_book_chapter.php',
  'classes/external/update_book_chapter.php',
  'classes/external/move_book_chapter.php',
  'classes/external/delete_book_chapter.php',
  'classes/external/get_lesson_access_information.php',
  'classes/external/get_lesson_details.php',
  'classes/external/get_course_lessons.php',
  'classes/external/get_lesson_pages.php',
  'classes/external/lesson_page_response.php',
  'classes/external/create_lesson_page.php',
  'classes/external/update_lesson_page.php',
  'classes/external/delete_lesson_page.php',
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
  'classes/external/export_question_bank_blueprint.php',
  'classes/external/import_question_bank_blueprint.php',
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
  'classes/external/create_feedback_item.php',
  'classes/external/update_feedback_item.php',
  'classes/external/set_workshop_phase.php',
  'classes/external/get_workshop_submissions.php',
  'classes/external/get_workshop_user_plan.php',
  'classes/external/get_workshop_grades.php',
  'classes/external/get_workshop_grades_report.php',
  'classes/external/get_workshop_reviewer_assessments.php',
  'classes/external/get_workshop_submission_assessments.php',
  'classes/external/set_workshop_grading_form.php',
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
  const auditedDmlBoundary = fromRoot('plugin/moodlia/classes/operation/book_chapter_tools.php').replaceAll('\\', '/');
  const forbiddenPatterns = [
    /\$DB\b/,
    /\bSELECT\b[\s\S]*\bFROM\b/i,
    /\bINSERT\s+INTO\b/i,
    /\bUPDATE\s+\S+\s+SET\b/i,
    /\bDELETE\s+FROM\b/i
  ];

  for (const file of files) {
    if (file.replaceAll('\\', '/') === auditedDmlBoundary) {
      const content = await fs.readFile(file, 'utf8');
      assert.match(content, /Moodle Book does not expose a public external or component writer API/);
      assert.doesNotMatch(content, /\bSELECT\b[\s\S]*\bFROM\b/i, `${file} must not contain raw SELECT SQL.`);
      assert.doesNotMatch(content, /\bINSERT\s+INTO\b/i, `${file} must not contain raw INSERT SQL.`);
      assert.doesNotMatch(content, /\bUPDATE\s+\S+\s+SET\b/i, `${file} must not contain raw UPDATE SQL.`);
      assert.doesNotMatch(content, /\bDELETE\s+FROM\b/i, `${file} must not contain raw DELETE SQL.`);
      continue;
    }

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
    ['move_question', ['moodle/question:movemine', 'moodle/question:moveall']],
    ['update_book_chapter', ['mod/book:edit']],
    ['move_book_chapter', ['mod/book:edit']],
    ['delete_book_chapter', ['mod/book:edit']],
    ['get_assignment_grading_form', ['mod/assign:grade']],
    ['set_assignment_rubric', ['mod/assign:grade', 'moodle/grade:managegradingforms']],
    ['set_assignment_checklist', ['mod/assign:grade', 'moodle/grade:managegradingforms']],
    ['set_assignment_marking_guide', ['mod/assign:grade', 'moodle/grade:managegradingforms']],
    ['grade_assignment_with_rubric', ['mod/assign:grade']],
    ['grade_assignment_with_checklist', ['mod/assign:grade']],
    ['grade_assignment_with_marking_guide', ['mod/assign:grade']]
  ]);

  const contextHelpers = [
    'require_assignment_context(',
    'validate_quiz_attempt_context(',
    'validate_quiz_attempt_review_context(',
    'validate_write_context('
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

test('question bank blueprint import and export stay portable and API-backed', async () => {
  const contract = JSON.parse(await fs.readFile(fromRoot('contract/operations.json'), 'utf8'));
  const byName = new Map(contract.operations.map((operation) => [operation.name, operation]));
  const services = await fs.readFile(fromRoot('plugin/moodlia/db/services.php'), 'utf8');
  const questionTools = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/question_tools.php'), 'utf8');
  const exportOperation = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/export_question_bank_blueprint.php'), 'utf8');
  const importOperation = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/import_question_bank_blueprint.php'), 'utf8');
  const exportExternal = await fs.readFile(fromRoot('plugin/moodlia/classes/external/export_question_bank_blueprint.php'), 'utf8');
  const importExternal = await fs.readFile(fromRoot('plugin/moodlia/classes/external/import_question_bank_blueprint.php'), 'utf8');

  for (const operationName of ['export_question_bank_blueprint', 'import_question_bank_blueprint']) {
    assert.ok(byName.has(operationName), `${operationName} must exist in the operation contract.`);
    assert.match(services, new RegExp(`local_moodlia_${operationName}\\b`), `${operationName} must be registered as REST.`);
  }

  assert.equal(byName.get('export_question_bank_blueprint')?.returns.blueprint_json, 'string');
  assert.equal(byName.get('import_question_bank_blueprint')?.parameters.blueprint_json.type, 'string');
  assert.equal(byName.get('import_question_bank_blueprint')?.returns.created_questions_json, 'string');
  assert.match(exportOperation, /moodlia\.question_bank_blueprint\.v1/);
  assert.match(exportOperation, /question_tools::get_question_objects/);
  assert.match(exportOperation, /question_tools::question_to_blueprint/);
  assert.match(importOperation, /create_question_category::execute/);
  assert.match(importOperation, /create_question::execute/);
  assert.match(questionTools, /function question_to_blueprint/);
  assert.match(questionTools, /function question_options_to_blueprint/);
  assert.match(questionTools, /function get_question_objects/);
  assert.doesNotMatch(exportOperation + importOperation, /\$DB\b/);
  assert.match(exportExternal, /require_capability\('moodle\/question:viewall'/);
  assert.match(importExternal, /require_capability\('moodle\/question:managecategory'/);
  assert.match(importExternal, /require_capability\('moodle\/question:add'/);
});

test('lesson content and truefalse page lifecycle uses Moodle Lesson component APIs', async () => {
  const contract = JSON.parse(await fs.readFile(fromRoot('contract/operations.json'), 'utf8'));
  const byName = new Map(contract.operations.map((operation) => [operation.name, operation]));
  const services = await fs.readFile(fromRoot('plugin/moodlia/db/services.php'), 'utf8');
  const lessonTools = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/lesson_tools.php'), 'utf8');
  const createOperation = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/create_lesson_page.php'), 'utf8');
  const updateOperation = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/update_lesson_page.php'), 'utf8');
  const deleteOperation = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/delete_lesson_page.php'), 'utf8');

  for (const operationName of ['create_lesson_page', 'update_lesson_page', 'delete_lesson_page']) {
    assert.ok(byName.has(operationName), `${operationName} must exist in the operation contract.`);
    assert.match(services, new RegExp(`local_moodlia_${operationName}\\b`), `${operationName} must be registered as REST.`);
    assert.equal(byName.get(operationName)?.capabilities[0], 'mod/lesson:manage');

    const external = await fs.readFile(fromRoot(`plugin/moodlia/classes/external/${operationName}.php`), 'utf8');
    assert.match(external, /require_capability\('local\/moodlia:useapi'/);
    assert.match(external, /require_capability\('mod\/lesson:manage'/);
  }

  assert.equal(byName.get('create_lesson_page')?.parameters.branches.type, 'object');
  assert.equal(byName.get('create_lesson_page')?.parameters.branches.required, false);
  assert.deepEqual(byName.get('create_lesson_page')?.parameters.page_type.enum, ['content', 'multichoice', 'truefalse']);
  assert.equal(byName.get('create_lesson_page')?.parameters.answers.type, 'object');
  assert.equal(byName.get('update_lesson_page')?.parameters.branches.required, false);
  assert.equal(byName.get('update_lesson_page')?.parameters.answers.required, false);
  assert.equal(byName.get('create_lesson_page')?.returns.page.branches[0].jump_to, 'integer');
  assert.match(lessonTools, /CONTENT_PAGE_TYPE\s*=\s*20/);
  assert.match(lessonTools, /TRUEFALSE_PAGE_TYPE\s*=\s*2/);
  assert.match(lessonTools, /MULTICHOICE_PAGE_TYPE\s*=\s*3/);
  assert.match(lessonTools, /function decode_branches/);
  assert.match(lessonTools, /function decode_truefalse_answers/);
  assert.match(lessonTools, /function decode_multichoice_answers/);
  assert.match(lessonTools, /function truefalse_page_properties/);
  assert.match(lessonTools, /function multichoice_page_properties/);
  assert.match(lessonTools, /function multichoice_answers_from_page/);
  assert.match(lessonTools, /function get_page/);
  assert.match(createOperation, /\\lesson_page::create/);
  assert.match(updateOperation, /->update\(/);
  assert.match(deleteOperation, /->delete\(/);
  assert.doesNotMatch(createOperation + updateOperation + deleteOperation, /\$DB\b/);
});

test('workshop grading form lifecycle uses Moodle strategy APIs', async () => {
  const contract = JSON.parse(await fs.readFile(fromRoot('contract/operations.json'), 'utf8'));
  const byName = new Map(contract.operations.map((operation) => [operation.name, operation]));
  const services = await fs.readFile(fromRoot('plugin/moodlia/db/services.php'), 'utf8');
  const workshopTools = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/workshop_tools.php'), 'utf8');
  const operation = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/set_workshop_grading_form.php'), 'utf8');
  const external = await fs.readFile(fromRoot('plugin/moodlia/classes/external/set_workshop_grading_form.php'), 'utf8');

  assert.ok(byName.has('set_workshop_grading_form'), 'set_workshop_grading_form must exist in the operation contract.');
  assert.deepEqual(byName.get('set_workshop_grading_form')?.parameters.strategy.enum, ['accumulative', 'comments', 'numerrors', 'rubric']);
  assert.equal(byName.get('set_workshop_grading_form')?.parameters.definition.type, 'object');
  assert.equal(byName.get('set_workshop_grading_form')?.capabilities[0], 'mod/workshop:editdimensions');
  assert.match(services, /local_moodlia_set_workshop_grading_form\b/);
  assert.match(external, /require_capability\('local\/moodlia:useapi'/);
  assert.match(external, /require_capability\('mod\/workshop:editdimensions'/);
  assert.match(workshopTools, /function decode_accumulative_definition/);
  assert.match(workshopTools, /function accumulative_edit_form_data/);
  assert.match(workshopTools, /function decode_comments_definition/);
  assert.match(workshopTools, /function comments_edit_form_data/);
  assert.match(workshopTools, /function decode_numerrors_definition/);
  assert.match(workshopTools, /function numerrors_edit_form_data/);
  assert.match(workshopTools, /function decode_rubric_definition/);
  assert.match(workshopTools, /function rubric_existing_dimensions/);
  assert.match(workshopTools, /function rubric_edit_form_data/);
  assert.match(workshopTools, /Number-of-errors mapping grade must be between 0 and 100/);
  assert.match(workshopTools, /grade0 and grade1 labels must be different/);
  assert.match(workshopTools, /definition\.layout must be list or grid/);
  assert.match(workshopTools, /Rubric dimensions must have unique descriptions/);
  assert.match(workshopTools, /Rubric level grades must be unique within each dimension/);
  assert.match(workshopTools, /trim\(strip_tags\(\$definition\)\) === ''/);
  assert.match(operation, /grading_strategy_instance\(\)/);
  assert.match(operation, /save_edit_strategy_form/);
  assert.match(operation, /PHASE_SETUP/);
  assert.doesNotMatch(operation, /\$DB\b/);
});

test('feedback item lifecycle uses Moodle item class APIs', async () => {
  const contract = JSON.parse(await fs.readFile(fromRoot('contract/operations.json'), 'utf8'));
  const byName = new Map(contract.operations.map((operation) => [operation.name, operation]));
  const services = await fs.readFile(fromRoot('plugin/moodlia/db/services.php'), 'utf8');
  const feedbackTools = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/feedback_tools.php'), 'utf8');
  const createOperation = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/create_feedback_item.php'), 'utf8');
  const updateOperation = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/update_feedback_item.php'), 'utf8');

  for (const operationName of ['create_feedback_item', 'update_feedback_item']) {
    const operation = byName.get(operationName);
    assert.ok(operation, `${operationName} must exist in the operation contract.`);
    assert.equal(operation.capabilities[0], 'mod/feedback:edititems');
    assert.equal(operation.parameters.definition.type, 'object');
    assert.match(services, new RegExp(`local_moodlia_${operationName}\\b`));

    const external = await fs.readFile(fromRoot(`plugin/moodlia/classes/external/${operationName}.php`), 'utf8');
    assert.match(external, /require_capability\('local\/moodlia:useapi'/);
    assert.match(external, /require_capability\('mod\/feedback:edititems'/);
    assert.match(external, /get_feedback_items::item_structure\(\)/);
  }

  assert.deepEqual(byName.get('create_feedback_item')?.parameters.type.enum, [
    'textfield',
    'textarea',
    'numeric',
    'multichoice',
    'multichoicerated',
    'label',
    'info',
    'pagebreak'
  ]);
  assert.equal(byName.get('update_feedback_item')?.parameters.item_id.required, true);
  assert.equal(byName.get('update_feedback_item')?.parameters.name.required, false);
  assert.match(feedbackTools, /function decode_item_definition/);
  assert.match(feedbackTools, /function save_item/);
  assert.match(feedbackTools, /feedback_create_pagebreak/);
  assert.match(feedbackTools, /feedback_get_item_class\(\$type\)/);
  assert.match(feedbackTools, /->build_editform\(/);
  assert.match(feedbackTools, /->set_data\(/);
  assert.match(feedbackTools, /->save_item\(/);
  assert.match(feedbackTools, /feedback_move_item/);
  assert.match(feedbackTools, /feedback_renumber_items/);
  assert.match(feedbackTools, /function rated_choice_options/);
  assert.match(feedbackTools, /function nullable_float_option/);
  assert.doesNotMatch(createOperation + updateOperation + feedbackTools, /\$DB\b/);
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
    'completion_use_grade',
    'completion_pass_grade',
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
  for (const option of ['visible', 'visible_on_course_page', 'id_number', 'group_mode', 'tags', 'download_content', 'completion_tracking', 'completion_view_required', 'completion_grade_item_number', 'completion_use_grade', 'completion_pass_grade', 'completion_expected', 'reset_completion_states']) {
    assert.ok(updateProperties[option], `update_module options must document ${option}.`);
  }
});

test('course quiz and completion regressions stay covered in plugin externals', async () => {
  const contract = JSON.parse(await fs.readFile(fromRoot('contract/operations.json'), 'utf8'));
  const getCourseQuizzes = contract.operations.find((operation) => operation.name === 'get_course_quizzes');

  assert.ok(getCourseQuizzes.parameters.course_id, 'get_course_quizzes must accept one course_id.');
  assert.ok(getCourseQuizzes.parameters.course_ids, 'get_course_quizzes must keep course_ids for batches.');

  const quizzesExternal = await fs.readFile(fromRoot('plugin/moodlia/classes/external/get_course_quizzes.php'), 'utf8');
  assert.match(quizzesExternal, /'course_id'\s*=>\s*new external_value\(PARAM_INT/);
  assert.match(quizzesExternal, /array_unshift\(\$decodedcourseids,\s*\(int\) \$courseid\)/);

  const questionTools = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/question_tools.php'), 'utf8');
  assert.match(questionTools, /preg_match\('\/\^\[0-9\]\+\(\?:\\s\*,\\s\*\[0-9\]\+\)\*\$\/'/);
  assert.match(questionTools, /JSON array, comma-separated list, or single positive integer/);

  const courseContentsOperation = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/get_course_contents.php'), 'utf8');
  const courseContentsExternal = await fs.readFile(fromRoot('plugin/moodlia/classes/external/get_course_contents.php'), 'utf8');
  for (const field of ['completion', 'completion_view', 'completion_grade_item_number', 'completion_expected']) {
    assert.ok(courseContentsOperation.includes(`'${field}'`), `get_course_contents operation must expose ${field}.`);
    assert.ok(courseContentsExternal.includes(`'${field}'`), `get_course_contents external return must declare ${field}.`);
  }
});

test('module completion updates clear native Moodle grade completion flags', async () => {
  const moduleCommonTools = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/module_common_tools.php'), 'utf8');

  for (const option of ['completion_use_grade', 'completionusegrade', 'completion_pass_grade', 'completionpassgrade']) {
    assert.ok(moduleCommonTools.includes(`'${option}'`), `module completion updates must accept ${option}.`);
  }

  assert.match(moduleCommonTools, /\$moduleinfo->completionusegrade\s*=\s*\$tracking === 2 && \$gradeitemnumber >= 0 \? 1 : 0;/);
  assert.match(moduleCommonTools, /\$moduleinfo->completionpassgrade\s*=\s*\$tracking === 2 && \$gradeitemnumber >= 0/);
  assert.match(moduleCommonTools, /if \(\!\$usegrade\) \{\s*return -1;\s*\}/s);
  assert.match(moduleCommonTools, /if \(\$tracking !== 2\) \{\s*if \(\(\$viewprovided && \$viewrequired\) \|\| \(\$gradeprovided && \$gradeitemnumber >= 0\)\)/s);
  assert.match(moduleCommonTools, /\$viewrequired = false;\s*\$gradeitemnumber = -1;/s);
});

test('course completion audit and repair operations cover stale grade completion edge cases', async () => {
  const contract = JSON.parse(await fs.readFile(fromRoot('contract/operations.json'), 'utf8'));
  const byName = new Map(contract.operations.map((operation) => [operation.name, operation]));
  const services = await fs.readFile(fromRoot('plugin/moodlia/db/services.php'), 'utf8');
  const completionAuditTools = await fs.readFile(
    fromRoot('plugin/moodlia/classes/operation/completion_audit_tools.php'),
    'utf8'
  );
  const repairExternal = await fs.readFile(
    fromRoot('plugin/moodlia/classes/external/repair_course_completion.php'),
    'utf8'
  );
  const statusExternal = await fs.readFile(
    fromRoot('plugin/moodlia/classes/external/get_moodlia_status.php'),
    'utf8'
  );

  for (const operationName of ['get_moodlia_status', 'audit_course_completion', 'repair_course_completion']) {
    assert.ok(byName.has(operationName), `${operationName} must exist in the operation contract.`);
    assert.match(services, new RegExp(`local_moodlia_${operationName}\\b`), `${operationName} must be registered as REST.`);
  }

  assert.match(completionAuditTools, /completion_tools::require_completion_api\(\);/);
  assert.match(completionAuditTools, /book_grade_completion/);
  assert.match(completionAuditTools, /view_and_grade_completion/);
  assert.match(completionAuditTools, /automatic_without_visible_rule/);
  assert.match(completionAuditTools, /update_module::execute/);
  assert.match(completionAuditTools, /'completion_use_grade'\s*=>\s*false/);
  assert.match(completionAuditTools, /'completion_pass_grade'\s*=>\s*false/);
  assert.match(completionAuditTools, /'completion_grade_item_number'\s*=>\s*-1/);
  assert.match(repairExternal, /require_capability\('moodle\/course:manageactivities'/);
  assert.match(statusExternal, /require_capability\('local\/moodlia:useapi'/);
});

test('native Moodle backup and restore operations use backup controllers and strict capabilities', async () => {
  const contract = JSON.parse(await fs.readFile(fromRoot('contract/operations.json'), 'utf8'));
  const byName = new Map(contract.operations.map((operation) => [operation.name, operation]));
  const services = await fs.readFile(fromRoot('plugin/moodlia/db/services.php'), 'utf8');
  const backupTools = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/course_backup_tools.php'), 'utf8');
  const backupExternal = await fs.readFile(fromRoot('plugin/moodlia/classes/external/backup_course.php'), 'utf8');
  const restoreExternal = await fs.readFile(fromRoot('plugin/moodlia/classes/external/restore_course_backup.php'), 'utf8');
  const uploadExternal = await fs.readFile(fromRoot('plugin/moodlia/classes/external/upload_course_backup.php'), 'utf8');
  const listExternal = await fs.readFile(fromRoot('plugin/moodlia/classes/external/get_course_backup_files.php'), 'utf8');
  const deleteExternal = await fs.readFile(fromRoot('plugin/moodlia/classes/external/delete_course_backup_file.php'), 'utf8');

  assert.equal(byName.get('backup_course')?.files, 'download');
  assert.equal(byName.get('restore_course_backup')?.type, 'write');
  assert.equal(byName.get('upload_course_backup')?.files, 'upload');
  assert.equal(byName.get('get_course_backup_files')?.files, 'metadata');
  assert.equal(byName.get('delete_course_backup_file')?.files, 'metadata');
  assert.deepEqual(byName.get('restore_course_backup')?.parameters.target.enum, [
    'new_course',
    'existing_add',
    'existing_delete'
  ]);

  for (const operationName of [
    'backup_course',
    'restore_course_backup',
    'upload_course_backup',
    'get_course_backup_files',
    'delete_course_backup_file'
  ]) {
    assert.match(services, new RegExp(`local_moodlia_${operationName}\\b`), `${operationName} must be registered as REST.`);
  }

  assert.match(backupTools, /new \\backup_controller/);
  assert.match(backupTools, /new \\restore_controller/);
  assert.match(backupTools, /\\restore_dbops::create_new_course/);
  assert.match(backupTools, /extract_to_pathname/);
  assert.match(backupTools, /create_file_from_string/);
  assert.match(backupTools, /get_area_files/);
  assert.match(backupTools, /\['backup', 'private'\]/);
  assert.match(backupTools, /delete_backup_file/);
  assert.match(backupTools, /\.mbz/);
  assert.match(backupExternal, /require_capability\('moodle\/backup:backupcourse'/);
  assert.match(restoreExternal, /require_capability\('moodle\/restore:restorecourse'/);
  assert.match(restoreExternal, /require_capability\('moodle\/course:create'/);
  assert.match(restoreExternal, /course_backup_tools::get_backup_file/);
  assert.match(restoreExternal, /CONTEXT_USER/);
  assert.match(restoreExternal, /CONTEXT_COURSE/);
  assert.match(uploadExternal, /require_capability\('local\/moodlia:useapi'/);
  assert.match(listExternal, /require_capability\('moodle\/backup:backupcourse'/);
  assert.match(deleteExternal, /CONTEXT_USER/);
  assert.match(deleteExternal, /require_capability\('moodle\/backup:backupcourse'/);
});

test('site administration operations manage users, cohorts, and course role assignments through Moodle APIs', async () => {
  const contract = JSON.parse(await fs.readFile(fromRoot('contract/operations.json'), 'utf8'));
  const byName = new Map(contract.operations.map((operation) => [operation.name, operation]));
  const services = await fs.readFile(fromRoot('plugin/moodlia/db/services.php'), 'utf8');
  const adminTools = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/admin_tools.php'), 'utf8');
  const [
    createUser,
    updateUser,
    deleteUser,
    createCohort,
    updateCohort,
    deleteCohort,
    addMember,
    removeMember,
    assignRole,
    unassignRole
  ] = await Promise.all([
    fs.readFile(fromRoot('plugin/moodlia/classes/operation/create_user.php'), 'utf8'),
    fs.readFile(fromRoot('plugin/moodlia/classes/operation/update_user.php'), 'utf8'),
    fs.readFile(fromRoot('plugin/moodlia/classes/operation/delete_user.php'), 'utf8'),
    fs.readFile(fromRoot('plugin/moodlia/classes/operation/create_cohort.php'), 'utf8'),
    fs.readFile(fromRoot('plugin/moodlia/classes/operation/update_cohort.php'), 'utf8'),
    fs.readFile(fromRoot('plugin/moodlia/classes/operation/delete_cohort.php'), 'utf8'),
    fs.readFile(fromRoot('plugin/moodlia/classes/operation/add_cohort_member.php'), 'utf8'),
    fs.readFile(fromRoot('plugin/moodlia/classes/operation/remove_cohort_member.php'), 'utf8'),
    fs.readFile(fromRoot('plugin/moodlia/classes/operation/assign_course_role.php'), 'utf8'),
    fs.readFile(fromRoot('plugin/moodlia/classes/operation/unassign_course_role.php'), 'utf8')
  ]);

  const operationNames = [
    'get_user_details',
    'create_user',
    'update_user',
    'delete_user',
    'create_cohort',
    'update_cohort',
    'delete_cohort',
    'add_cohort_member',
    'remove_cohort_member',
    'assign_course_role',
    'unassign_course_role'
  ];

  for (const operationName of operationNames) {
    assert.ok(byName.has(operationName), `${operationName} must exist in the operation contract.`);
    assert.match(services, new RegExp(`local_moodlia_${operationName}\\b`), `${operationName} must be registered as REST.`);
  }

  assert.equal(byName.get('create_user')?.type, 'write');
  assert.equal(byName.get('create_cohort')?.type, 'write');
  assert.equal(byName.get('assign_course_role')?.context, 'course');
  assert.deepEqual(byName.get('assign_course_role')?.parameters.role_archetype.enum, [
    'student',
    'teacher',
    'editingteacher'
  ]);

  assert.match(adminTools, /user\/lib\.php/);
  assert.match(adminTools, /cohort\/lib\.php/);
  assert.match(adminTools, /accesslib\.php/);
  assert.match(adminTools, /\\core_user::get_user/);
  assert.match(adminTools, /cohort_get_cohort/);
  assert.match(adminTools, /resolve_role_id/);

  assert.match(createUser, /user_create_user/);
  assert.match(updateUser, /user_update_user/);
  assert.match(deleteUser, /delete_user/);
  assert.match(createCohort, /cohort_add_cohort/);
  assert.match(updateCohort, /cohort_update_cohort/);
  assert.match(deleteCohort, /cohort_delete_cohort/);
  assert.match(addMember, /cohort_add_member/);
  assert.match(removeMember, /cohort_remove_member/);
  assert.match(assignRole, /role_assign/);
  assert.match(unassignRole, /role_unassign/);

  for (const [operationName, capability] of [
    ['get_user_details', 'moodle/user:viewdetails'],
    ['create_user', 'moodle/user:create'],
    ['update_user', 'moodle/user:update'],
    ['delete_user', 'moodle/user:delete'],
    ['create_cohort', 'moodle/cohort:manage'],
    ['update_cohort', 'moodle/cohort:manage'],
    ['delete_cohort', 'moodle/cohort:manage'],
    ['add_cohort_member', 'moodle/cohort:manage'],
    ['remove_cohort_member', 'moodle/cohort:manage'],
    ['assign_course_role', 'moodle/role:assign'],
    ['unassign_course_role', 'moodle/role:assign']
  ]) {
    const external = await fs.readFile(fromRoot(`plugin/moodlia/classes/external/${operationName}.php`), 'utf8');
    assert.match(external, /require_capability\('local\/moodlia:useapi'/);
    assert.ok(
      external.includes(`require_capability('${capability}'`),
      `${operationName} must require ${capability}.`
    );
  }
});

test('advanced gradebook operations manage manual categories, items, and grades through Moodle grade APIs', async () => {
  const contract = JSON.parse(await fs.readFile(fromRoot('contract/operations.json'), 'utf8'));
  const byName = new Map(contract.operations.map((operation) => [operation.name, operation]));
  const services = await fs.readFile(fromRoot('plugin/moodlia/db/services.php'), 'utf8');
  const gradebookTools = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/gradebook_tools.php'), 'utf8');
  const createCategory = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/create_grade_category.php'), 'utf8');
  const updateCategory = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/update_grade_category.php'), 'utf8');
  const deleteCategory = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/delete_grade_category.php'), 'utf8');
  const createItem = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/create_grade_item.php'), 'utf8');
  const updateItem = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/update_grade_item.php'), 'utf8');
  const deleteItem = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/delete_grade_item.php'), 'utf8');
  const updateValue = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/update_grade_value.php'), 'utf8');

  const operationNames = [
    'get_grade_categories',
    'create_grade_category',
    'update_grade_category',
    'delete_grade_category',
    'create_grade_item',
    'update_grade_item',
    'delete_grade_item',
    'update_grade_value'
  ];

  for (const operationName of operationNames) {
    assert.ok(byName.has(operationName), `${operationName} must exist in the operation contract.`);
    assert.match(services, new RegExp(`local_moodlia_${operationName}\\b`), `${operationName} must be registered as REST.`);
  }

  assert.equal(byName.get('create_grade_category')?.capabilities[0], 'moodle/grade:manage');
  assert.equal(byName.get('create_grade_item')?.capabilities[0], 'moodle/grade:manage');
  assert.equal(byName.get('update_grade_value')?.capabilities[0], 'moodle/grade:edit');
  assert.equal(byName.get('create_grade_item')?.parameters.grade_max.type, 'number');

  assert.match(gradebookTools, /grade\/grade_category\.php/);
  assert.match(gradebookTools, /grade\/grade_item\.php/);
  assert.match(gradebookTools, /\\grade_category::fetch/);
  assert.match(gradebookTools, /\\grade_item::fetch/);
  assert.match(gradebookTools, /require_manual_grade_item/);

  assert.match(createCategory, /new \\grade_category/);
  assert.match(updateCategory, /->update\('local_moodlia'\)/);
  assert.match(deleteCategory, /->delete\('local_moodlia'\)/);
  assert.match(createItem, /new \\grade_item/);
  assert.match(createItem, /'itemtype'\s*=>\s*'manual'/);
  assert.match(updateItem, /require_manual_grade_item/);
  assert.match(deleteItem, /require_manual_grade_item/);
  assert.match(updateValue, /require_manual_grade_item/);
  assert.match(updateValue, /update_final_grade/);

  for (const [operationName, capability] of [
    ['get_grade_categories', 'moodle/grade:viewall'],
    ['create_grade_category', 'moodle/grade:manage'],
    ['update_grade_category', 'moodle/grade:manage'],
    ['delete_grade_category', 'moodle/grade:manage'],
    ['create_grade_item', 'moodle/grade:manage'],
    ['update_grade_item', 'moodle/grade:manage'],
    ['delete_grade_item', 'moodle/grade:manage'],
    ['update_grade_value', 'moodle/grade:edit']
  ]) {
    const external = await fs.readFile(fromRoot(`plugin/moodlia/classes/external/${operationName}.php`), 'utf8');
    assert.match(external, /require_capability\('local\/moodlia:useapi'/);
    assert.ok(
      external.includes(`require_capability('${capability}'`),
      `${operationName} must require ${capability}.`
    );
  }
});
