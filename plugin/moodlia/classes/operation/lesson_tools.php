<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Shared lesson helpers.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Helper methods for Moodle Lesson operations.
 */
class lesson_tools {
    /**
     * Load Moodle Lesson APIs.
     */
    public static function require_lesson_api(): void {
        global $CFG;

        require_once($CFG->dirroot . '/mod/lesson/lib.php');
        require_once($CFG->dirroot . '/mod/lesson/locallib.php');
        require_once($CFG->dirroot . '/mod/lesson/classes/external.php');
    }

    /**
     * Verify that a course module belongs to a Lesson activity.
     *
     * @param \stdClass $course Moodle course.
     * @param int $cmid Course module id.
     * @return \cm_info
     */
    public static function get_lesson_module(\stdClass $course, int $cmid): \cm_info {
        $cm = module_tools::get_course_module($course, $cmid);
        if ($cm->modname !== 'lesson') {
            throw new \invalid_parameter_exception('module_id must reference a lesson activity.');
        }

        return $cm;
    }

    /**
     * Return a canonical Lesson access information response.
     *
     * @param \cm_info $cm Lesson course module.
     * @param array $result Moodle external API result.
     * @return array
     */
    public static function access_information_to_response(\cm_info $cm, array $result): array {
        return [
            'module_id' => (int) $cm->id,
            'lesson_id' => (int) $cm->instance,
            'can_manage' => (bool) ($result['canmanage'] ?? false),
            'can_grade' => (bool) ($result['cangrade'] ?? false),
            'can_view_reports' => (bool) ($result['canviewreports'] ?? false),
            'review_mode' => (bool) ($result['reviewmode'] ?? false),
            'attempts_count' => (int) ($result['attemptscount'] ?? 0),
            'last_page_seen' => (int) ($result['lastpageseen'] ?? 0),
            'left_during_timed_session' => (bool) ($result['leftduringtimedsession'] ?? false),
            'first_page_id' => (int) ($result['firstpageid'] ?? 0),
            'prevent_access_reasons' => self::prevent_access_reasons_to_response($result['preventaccessreasons'] ?? []),
            'warnings' => self::warnings_to_response($result['warnings'] ?? []),
        ];
    }

    /**
     * Return a canonical Lesson pages response.
     *
     * @param \cm_info $cm Lesson course module.
     * @param array $result Moodle external API result.
     * @return array
     */
    public static function pages_to_response(\cm_info $cm, array $result): array {
        $pages = [];
        foreach (($result['pages'] ?? []) as $pageentry) {
            $item = (array) $pageentry;
            $page = (array) ($item['page'] ?? []);
            $pages[] = [
                'page_id' => (int) ($page['id'] ?? 0),
                'lesson_id' => (int) ($page['lessonid'] ?? $cm->instance),
                'module_id' => (int) $cm->id,
                'previous_page_id' => (int) ($page['prevpageid'] ?? 0),
                'next_page_id' => (int) ($page['nextpageid'] ?? 0),
                'question_type' => (int) ($page['qtype'] ?? 0),
                'question_option' => (int) ($page['qoption'] ?? 0),
                'layout' => (int) ($page['layout'] ?? 0),
                'display' => (int) ($page['display'] ?? 0),
                'display_in_menu_block' => (bool) ($page['displayinmenublock'] ?? false),
                'type' => (int) ($page['type'] ?? 0),
                'type_id' => (int) ($page['typeid'] ?? 0),
                'type_string' => (string) ($page['typestring'] ?? ''),
                'title' => (string) ($page['title'] ?? ''),
                'content' => (string) ($page['contents'] ?? ''),
                'content_format' => (int) ($page['contentsformat'] ?? FORMAT_HTML),
                'time_created' => (int) ($page['timecreated'] ?? 0),
                'time_modified' => (int) ($page['timemodified'] ?? 0),
                'answer_ids' => array_map('intval', $item['answerids'] ?? []),
                'jumps' => array_map('intval', $item['jumps'] ?? []),
                'files_count' => (int) ($item['filescount'] ?? 0),
                'files_size_total' => (int) ($item['filessizetotal'] ?? 0),
            ];
        }

        return [
            'module_id' => (int) $cm->id,
            'lesson_id' => (int) $cm->instance,
            'count' => count($pages),
            'pages' => $pages,
            'warnings' => self::warnings_to_response($result['warnings'] ?? []),
        ];
    }

    /**
     * Return a canonical Lesson details response.
     *
     * @param \stdClass $course Moodle course.
     * @param \cm_info $cm Lesson course module.
     * @param array $result Moodle external API result.
     * @return array
     */
    public static function lesson_details_to_response(\stdClass $course, \cm_info $cm, array $result): array {
        $lesson = (array) ($result['lesson'] ?? []);

        return [
            'lesson' => self::lesson_summary_to_response($course, $cm, $lesson),
            'warnings' => self::warnings_to_response($result['warnings'] ?? []),
        ];
    }

    /**
     * Return a canonical course Lesson listing response.
     *
     * @param \stdClass $course Moodle course.
     * @param array $result Moodle external API result.
     * @return array
     */
    public static function course_lessons_to_response(\stdClass $course, array $result): array {
        $lessons = [];
        foreach (($result['lessons'] ?? []) as $lessonentry) {
            $lessons[] = self::lesson_summary_to_response($course, null, (array) $lessonentry);
        }

        return [
            'course_id' => (int) $course->id,
            'count' => count($lessons),
            'lessons' => $lessons,
            'warnings' => self::warnings_to_response($result['warnings'] ?? []),
        ];
    }

    /**
     * Return a canonical Lesson possible jumps response.
     *
     * @param \cm_info $cm Lesson course module.
     * @param array $result Moodle external API result.
     * @return array
     */
    public static function possible_jumps_to_response(\cm_info $cm, array $result): array {
        $jumps = [];
        foreach (($result['jumps'] ?? []) as $jumpentry) {
            $jump = (array) $jumpentry;
            $jumps[] = [
                'page_id' => (int) ($jump['pageid'] ?? 0),
                'answer_id' => (int) ($jump['answerid'] ?? 0),
                'jump_to' => (int) ($jump['jumpto'] ?? 0),
                'calculated_jump' => (int) ($jump['calculatedjump'] ?? 0),
            ];
        }

        return [
            'module_id' => (int) $cm->id,
            'lesson_id' => (int) $cm->instance,
            'count' => count($jumps),
            'jumps' => $jumps,
            'warnings' => self::warnings_to_response($result['warnings'] ?? []),
        ];
    }

    /**
     * Return a canonical Lesson summary.
     *
     * @param \stdClass $course Moodle course.
     * @param \cm_info|null $cm Optional Lesson course module.
     * @param array $lesson Moodle Lesson summary exporter data.
     * @return array
     */
    public static function lesson_summary_to_response(\stdClass $course, ?\cm_info $cm, array $lesson): array {
        $introfiles = $lesson['introfiles'] ?? [];
        $mediafiles = $lesson['mediafiles'] ?? [];

        return [
            'module_id' => (int) ($lesson['coursemodule'] ?? ($cm ? $cm->id : 0)),
            'lesson_id' => (int) ($lesson['id'] ?? ($cm ? $cm->instance : 0)),
            'course_id' => (int) ($lesson['course'] ?? $course->id),
            'name' => (string) ($lesson['name'] ?? ''),
            'intro' => (string) ($lesson['intro'] ?? ''),
            'intro_format' => (int) ($lesson['introformat'] ?? FORMAT_MOODLE),
            'language' => (string) ($lesson['lang'] ?? ''),
            'grade' => (int) ($lesson['grade'] ?? 0),
            'practice' => (bool) ($lesson['practice'] ?? false),
            'allow_review' => (bool) ($lesson['modattempts'] ?? false),
            'use_password' => (bool) ($lesson['usepassword'] ?? false),
            'custom_scoring' => (bool) ($lesson['custom'] ?? false),
            'ongoing_score' => (bool) ($lesson['ongoing'] ?? false),
            'use_max_grade' => (bool) ($lesson['usemaxgrade'] ?? false),
            'max_answers' => (int) ($lesson['maxanswers'] ?? 0),
            'max_attempts' => (int) ($lesson['maxattempts'] ?? 0),
            'allow_question_retry' => (bool) ($lesson['review'] ?? false),
            'after_correct_answer' => (int) ($lesson['nextpagedefault'] ?? 0),
            'default_feedback' => (bool) ($lesson['feedback'] ?? false),
            'minimum_questions' => (int) ($lesson['minquestions'] ?? 0),
            'pages_to_show' => (int) ($lesson['maxpages'] ?? 0),
            'time_limit_seconds' => (int) ($lesson['timelimit'] ?? 0),
            'retakes_allowed' => (bool) ($lesson['retake'] ?? false),
            'activity_link' => (int) ($lesson['activitylink'] ?? 0),
            'slideshow' => (bool) ($lesson['slideshow'] ?? false),
            'slideshow_width' => (int) ($lesson['width'] ?? 0),
            'slideshow_height' => (int) ($lesson['height'] ?? 0),
            'slideshow_background' => (string) ($lesson['bgcolor'] ?? ''),
            'display_left_menu' => (bool) ($lesson['displayleft'] ?? false),
            'display_left_if' => (int) ($lesson['displayleftif'] ?? 0),
            'progress_bar' => (bool) ($lesson['progressbar'] ?? false),
            'available_from' => (int) ($lesson['available'] ?? 0),
            'deadline' => (int) ($lesson['deadline'] ?? 0),
            'time_modified' => (int) ($lesson['timemodified'] ?? 0),
            'completion_end_reached' => (bool) ($lesson['completionendreached'] ?? false),
            'completion_time_spent_seconds' => (int) ($lesson['completiontimespent'] ?? 0),
            'allow_offline_attempts' => (bool) ($lesson['allowofflineattempts'] ?? false),
            'intro_files_count' => is_array($introfiles) ? count($introfiles) : 0,
            'media_files_count' => is_array($mediafiles) ? count($mediafiles) : 0,
        ];
    }

    /**
     * Return a canonical Lesson user grade response.
     *
     * @param \cm_info $cm Lesson course module.
     * @param int $userid Moodle user id, or 0 when Moodle used the current user.
     * @param array $result Moodle external API result.
     * @return array
     */
    public static function user_grade_to_response(\cm_info $cm, int $userid, array $result): array {
        $hasgrade = $result['grade'] !== null && $result['grade'] !== '';
        return [
            'module_id' => (int) $cm->id,
            'lesson_id' => (int) $cm->instance,
            'user_id' => max(0, $userid),
            'has_grade' => $hasgrade,
            'grade' => $hasgrade ? (float) $result['grade'] : 0.0,
            'formatted_grade' => (string) ($result['formattedgrade'] ?? ''),
            'warnings' => self::warnings_to_response($result['warnings'] ?? []),
        ];
    }

    /**
     * Return a canonical Lesson user timers response.
     *
     * @param \cm_info $cm Lesson course module.
     * @param int $userid Moodle user id, or 0 when Moodle used the current user.
     * @param array $result Moodle external API result.
     * @return array
     */
    public static function user_timers_to_response(\cm_info $cm, int $userid, array $result): array {
        $timers = [];
        foreach (($result['timers'] ?? []) as $timer) {
            $item = (array) $timer;
            $timers[] = [
                'timer_id' => (int) ($item['id'] ?? 0),
                'lesson_id' => (int) ($item['lessonid'] ?? $cm->instance),
                'module_id' => (int) $cm->id,
                'user_id' => (int) ($item['userid'] ?? $userid),
                'start_time' => (int) ($item['starttime'] ?? 0),
                'lesson_time' => (int) ($item['lessontime'] ?? 0),
                'completed' => (bool) ($item['completed'] ?? false),
                'time_modified_offline' => (int) ($item['timemodifiedoffline'] ?? 0),
            ];
        }

        return [
            'module_id' => (int) $cm->id,
            'lesson_id' => (int) $cm->instance,
            'user_id' => max(0, $userid),
            'count' => count($timers),
            'timers' => $timers,
            'warnings' => self::warnings_to_response($result['warnings'] ?? []),
        ];
    }

    /**
     * Return a canonical Lesson attempts overview response.
     *
     * @param \cm_info $cm Lesson course module.
     * @param int $groupid Moodle group id.
     * @param array $result Moodle external API result.
     * @return array
     */
    public static function attempts_overview_to_response(\cm_info $cm, int $groupid, array $result): array {
        $data = (array) ($result['data'] ?? []);
        $students = [];
        foreach (($data['students'] ?? []) as $student) {
            $item = (array) $student;
            $attempts = [];
            foreach (($item['attempts'] ?? []) as $attempt) {
                $attemptitem = (array) $attempt;
                $attempts[] = [
                    'attempt_number' => (int) ($attemptitem['try'] ?? 0),
                    'grade' => (float) ($attemptitem['grade'] ?? 0),
                    'time_start' => (int) ($attemptitem['timestart'] ?? 0),
                    'time_end' => (int) ($attemptitem['timeend'] ?? 0),
                    'end_time' => (int) ($attemptitem['end'] ?? 0),
                ];
            }
            $students[] = [
                'user_id' => (int) ($item['id'] ?? 0),
                'full_name' => (string) ($item['fullname'] ?? ''),
                'best_grade' => (float) ($item['bestgrade'] ?? 0),
                'attempts' => $attempts,
            ];
        }

        return [
            'module_id' => (int) $cm->id,
            'lesson_id' => (int) $cm->instance,
            'group_id' => max(0, $groupid),
            'lesson_scored' => (bool) ($data['lessonscored'] ?? false),
            'attempts_count' => (int) ($data['numofattempts'] ?? 0),
            'average_score' => (float) ($data['avescore'] ?? 0),
            'high_score' => (float) ($data['highscore'] ?? 0),
            'low_score' => (float) ($data['lowscore'] ?? 0),
            'average_time' => (int) ($data['avetime'] ?? 0),
            'high_time' => (int) ($data['hightime'] ?? 0),
            'low_time' => (int) ($data['lowtime'] ?? 0),
            'students' => $students,
            'warnings' => self::warnings_to_response($result['warnings'] ?? []),
        ];
    }

    /**
     * Normalize Moodle warning payloads.
     *
     * @param array $warnings Moodle warnings.
     * @return array
     */
    public static function warnings_to_response(array $warnings): array {
        $mapped = [];
        foreach ($warnings as $warning) {
            $item = is_array($warning) ? $warning : (array) $warning;
            $mapped[] = [
                'item' => (string) ($item['item'] ?? ''),
                'item_id' => (int) ($item['itemid'] ?? 0),
                'warning_code' => (string) ($item['warningcode'] ?? ''),
                'message' => (string) ($item['message'] ?? ''),
            ];
        }

        return $mapped;
    }

    /**
     * Normalize Lesson prevent-access reasons.
     *
     * @param array $reasons Moodle prevent-access reasons.
     * @return array
     */
    private static function prevent_access_reasons_to_response(array $reasons): array {
        $mapped = [];
        foreach ($reasons as $reason) {
            $item = is_array($reason) ? $reason : (array) $reason;
            $data = $item['data'] ?? '';
            $encodeddata = json_encode($data, JSON_UNESCAPED_SLASHES);
            $mapped[] = [
                'reason' => (string) ($item['reason'] ?? ''),
                'data' => is_scalar($data) || $data === null ? (string) $data : ($encodeddata === false ? '' : $encodeddata),
                'message' => (string) ($item['message'] ?? ''),
            ];
        }

        return $mapped;
    }
}
