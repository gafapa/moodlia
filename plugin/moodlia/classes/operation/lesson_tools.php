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
    /** Moodle Lesson content page type id. */
    private const CONTENT_PAGE_TYPE = 20;

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
     * Return lesson instance data exposed through Moodle's Lesson external API.
     *
     * @param \stdClass $course Moodle course.
     * @param \cm_info $cm Lesson course module.
     * @return array
     */
    public static function get_lesson_instance_data(\stdClass $course, \cm_info $cm): array {
        self::require_lesson_api();

        $result = \mod_lesson_external::get_lessons_by_courses([(int) $course->id]);
        foreach (($result['lessons'] ?? []) as $lesson) {
            $lesson = (array) $lesson;
            if (
                (int) ($lesson['id'] ?? 0) === (int) $cm->instance ||
                (int) ($lesson['coursemodule'] ?? $lesson['cmid'] ?? $lesson['coursemoduleid'] ?? 0) === (int) $cm->id
            ) {
                return $lesson;
            }
        }

        throw new \invalid_parameter_exception('module_id must reference a visible lesson activity in the selected course.');
    }

    /**
     * Return a Lesson domain object with course and course-module context.
     *
     * @param \stdClass $course Moodle course.
     * @param \cm_info $cm Lesson course module.
     * @return \lesson
     */
    public static function get_lesson_object(\stdClass $course, \cm_info $cm): \lesson {
        self::require_lesson_api();

        $data = (object) self::get_lesson_instance_data($course, $cm);
        $data->id = (int) $cm->instance;
        $data->course = (int) $course->id;
        $cmrecord = get_coursemodule_from_id('lesson', (int) $cm->id, (int) $course->id, false, MUST_EXIST);

        return new \lesson($data, $cmrecord, $course);
    }

    /**
     * Prepare Moodle page globals required by Lesson page component APIs.
     *
     * @param \stdClass $course Moodle course.
     * @param \cm_info $cm Lesson course module.
     * @return \stdClass Course-module record.
     */
    public static function prepare_page_context(\stdClass $course, \cm_info $cm): \stdClass {
        global $PAGE;

        $cmrecord = get_coursemodule_from_id('lesson', (int) $cm->id, (int) $course->id, false, MUST_EXIST);
        $PAGE->set_course($course);
        $PAGE->set_cm($cmrecord, $course);

        return $cmrecord;
    }

    /**
     * Return a Lesson page and verify ownership.
     *
     * @param \lesson $lesson Lesson domain object.
     * @param \cm_info $cm Lesson course module.
     * @param int $pageid Lesson page id.
     * @return \lesson_page
     */
    public static function get_page(\lesson $lesson, \cm_info $cm, int $pageid): \lesson_page {
        if ($pageid <= 0) {
            throw new \invalid_parameter_exception('page_id must be a positive integer.');
        }

        $page = \lesson_page::load($pageid, $lesson);
        $properties = $page->properties();
        if ((int) ($properties->lessonid ?? 0) !== (int) $cm->instance) {
            throw new \invalid_parameter_exception('page_id must reference a page in the selected lesson module.');
        }

        return $page;
    }

    /**
     * Return a canonical response for one Lesson page.
     *
     * @param \cm_info $cm Lesson course module.
     * @param \lesson_page $page Lesson page object.
     * @return array
     */
    public static function page_to_response(\cm_info $cm, \lesson_page $page): array {
        $properties = $page->properties();
        $answers = [];
        $answerids = [];
        $jumps = [];

        foreach ($page->get_answers() as $answer) {
            $answers[] = [
                'answer_id' => (int) ($answer->id ?? 0),
                'title' => (string) ($answer->answer ?? ''),
                'title_format' => (int) ($answer->answerformat ?? FORMAT_MOODLE),
                'response' => (string) ($answer->response ?? ''),
                'response_format' => (int) ($answer->responseformat ?? FORMAT_MOODLE),
                'jump_to' => (int) ($answer->jumpto ?? 0),
                'score' => (float) ($answer->score ?? 0),
            ];
            $answerids[] = (int) ($answer->id ?? 0);
            $jumps[] = (int) ($answer->jumpto ?? 0);
        }

        return [
            'page_id' => (int) ($properties->id ?? 0),
            'lesson_id' => (int) ($properties->lessonid ?? $cm->instance),
            'module_id' => (int) $cm->id,
            'previous_page_id' => (int) ($properties->prevpageid ?? 0),
            'next_page_id' => (int) ($properties->nextpageid ?? 0),
            'question_type' => (int) ($properties->qtype ?? 0),
            'question_option' => (int) ($properties->qoption ?? 0),
            'layout' => (int) ($properties->layout ?? 0),
            'display' => (int) ($properties->display ?? 0),
            'display_in_menu_block' => (bool) ($properties->display ?? false),
            'type' => (int) ($page->type ?? 0),
            'type_id' => (int) ($page->typeid ?? ($properties->qtype ?? 0)),
            'type_string' => (string) ($page->typestring ?? ''),
            'title' => (string) ($properties->title ?? ''),
            'content' => (string) ($properties->contents ?? ''),
            'content_format' => (int) ($properties->contentsformat ?? FORMAT_HTML),
            'time_created' => (int) ($properties->timecreated ?? 0),
            'time_modified' => (int) ($properties->timemodified ?? 0),
            'answer_ids' => $answerids,
            'jumps' => $jumps,
            'files_count' => 0,
            'files_size_total' => 0,
            'branches_count' => count($answers),
            'branches' => $answers,
        ];
    }

    /**
     * Decode and validate Lesson content page branches.
     *
     * @param string $branchesjson JSON object or array.
     * @return array
     */
    public static function decode_branches(string $branchesjson): array {
        $decoded = json_decode($branchesjson, true);
        if (!is_array($decoded)) {
            throw new \invalid_parameter_exception('branches must be a JSON array or an object with a branches array.');
        }

        $items = self::is_list_array($decoded) ? $decoded : ($decoded['branches'] ?? null);
        if (!is_array($items) || !self::is_list_array($items) || count($items) === 0) {
            throw new \invalid_parameter_exception('branches must contain at least one branch.');
        }

        $branches = [];
        foreach ($items as $item) {
            if (!is_array($item)) {
                throw new \invalid_parameter_exception('Each branch must be an object.');
            }
            $title = trim((string) ($item['title'] ?? $item['answer'] ?? ''));
            if ($title === '') {
                throw new \invalid_parameter_exception('Each branch title must be non-empty.');
            }
            $branches[] = [
                'title' => $title,
                'response' => (string) ($item['response'] ?? ''),
                'jump_to' => self::normalise_jump($item['jump_to'] ?? $item['jumpto'] ?? -1),
                'score' => (float) ($item['score'] ?? 0),
            ];
        }

        return $branches;
    }

    /**
     * Build Moodle Lesson page properties for a content page.
     *
     * @param \lesson $lesson Lesson domain object.
     * @param string $title Page title.
     * @param string $content Page content.
     * @param int $contentformat Content format.
     * @param array $branches Normalized branch rows.
     * @param int $afterpageid Previous page id or 0 for first.
     * @param bool $displayinmenu Whether the page appears in Lesson menu.
     * @param bool $horizontal Whether branch buttons are horizontal.
     * @return \stdClass
     */
    public static function content_page_properties(
        \lesson $lesson,
        string $title,
        string $content,
        int $contentformat,
        array $branches,
        int $afterpageid = 0,
        bool $displayinmenu = true,
        bool $horizontal = true
    ): \stdClass {
        $title = trim($title);
        if ($title === '') {
            throw new \invalid_parameter_exception('title must be non-empty.');
        }

        $properties = (object) [
            'title' => $title,
            'contents_editor' => [
                'text' => $content,
                'format' => $contentformat,
            ],
            'qtype' => self::CONTENT_PAGE_TYPE,
            'qoption' => 0,
            'pageid' => max(0, $afterpageid),
            'layout' => $horizontal ? 1 : 0,
            'display' => $displayinmenu ? 1 : 0,
            'answer_editor' => [],
            'response_editor' => [],
            'jumpto' => [],
            'score' => [],
        ];

        $index = 0;
        foreach (array_slice($branches, 0, max(1, (int) $lesson->maxanswers)) as $branch) {
            $properties->answer_editor[$index] = $branch['title'];
            $properties->response_editor[$index] = [
                'text' => $branch['response'],
                'format' => FORMAT_HTML,
            ];
            $properties->jumpto[$index] = $branch['jump_to'];
            $properties->score[$index] = $branch['score'];
            $index++;
        }

        return $properties;
    }

    /**
     * Return current content-page branches for update preservation.
     *
     * @param \lesson_page $page Lesson page object.
     * @return array
     */
    public static function branches_from_page(\lesson_page $page): array {
        $branches = [];
        foreach ($page->get_answers() as $answer) {
            $title = (string) ($answer->answer ?? '');
            if ($title === '') {
                continue;
            }
            $branches[] = [
                'title' => $title,
                'response' => (string) ($answer->response ?? ''),
                'jump_to' => (int) ($answer->jumpto ?? 0),
                'score' => (float) ($answer->score ?? 0),
            ];
        }

        return $branches;
    }

    /**
     * Normalize a Lesson jump target.
     *
     * @param mixed $value Raw jump value.
     * @return int
     */
    private static function normalise_jump($value): int {
        if (is_string($value)) {
            $map = [
                'this_page' => 0,
                'next_page' => -1,
                'previous_page' => -40,
                'end_of_lesson' => -9,
            ];
            $key = strtolower(trim($value));
            if (array_key_exists($key, $map)) {
                return $map[$key];
            }
        }

        if (!is_numeric($value)) {
            throw new \invalid_parameter_exception('branch jump_to must be an integer or supported jump name.');
        }

        return (int) $value;
    }

    /**
     * Return whether an array has consecutive integer keys.
     *
     * @param array $value Array to inspect.
     * @return bool
     */
    private static function is_list_array(array $value): bool {
        return array_keys($value) === range(0, count($value) - 1);
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
