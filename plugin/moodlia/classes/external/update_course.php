<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Update course external function.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\external;

defined('MOODLE_INTERNAL') || die();

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;
use local_moodlia\operation\course_tools;
use local_moodlia\operation\update_course as update_course_operation;

/**
 * External API adapter for update_course.
 */
class update_course extends external_api {
    /**
     * Define input parameters.
     *
     * @return external_function_parameters
     */
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'course_id' => new external_value(PARAM_INT, 'Moodle course id'),
            'fullname' => new external_value(PARAM_TEXT, 'Course full name', VALUE_DEFAULT, null, NULL_ALLOWED),
            'shortname' => new external_value(PARAM_TEXT, 'Course short name', VALUE_DEFAULT, null, NULL_ALLOWED),
            'visible' => new external_value(PARAM_BOOL, 'Whether the course is visible', VALUE_DEFAULT, null, NULL_ALLOWED),
            'summary' => new external_value(PARAM_RAW, 'Course summary', VALUE_DEFAULT, null, NULL_ALLOWED),
            'summary_format' => new external_value(PARAM_ALPHA, 'Course summary format: html or plain', VALUE_DEFAULT, null, NULL_ALLOWED),
            'course_format' => new external_value(PARAM_PLUGIN, 'Moodle course format plugin name', VALUE_DEFAULT, null, NULL_ALLOWED),
            'enable_completion' => new external_value(PARAM_BOOL, 'Whether course completion tracking is enabled', VALUE_DEFAULT, null, NULL_ALLOWED),
            'start_date' => new external_value(PARAM_INT, 'Course start Unix timestamp', VALUE_DEFAULT, null, NULL_ALLOWED),
            'end_date' => new external_value(PARAM_INT, 'Course end Unix timestamp, or 0', VALUE_DEFAULT, null, NULL_ALLOWED),
        ]);
    }

    /**
     * Execute the external function.
     *
     * @param int $course_id Moodle course id.
     * @param string|null $fullname Course full name.
     * @param string|null $shortname Course short name.
     * @param bool|null $visible Whether the course is visible.
     * @param string|null $summary Course summary.
     * @param string|null $summary_format Course summary format.
     * @param string|null $course_format Course format plugin name.
     * @param bool|null $enable_completion Whether course completion tracking is enabled.
     * @param int|null $start_date Course start Unix timestamp.
     * @param int|null $end_date Course end Unix timestamp, or 0.
     * @return array
     */
    public static function execute(
        int $course_id,
        ?string $fullname = null,
        ?string $shortname = null,
        ?bool $visible = null,
        ?string $summary = null,
        ?string $summary_format = null,
        ?string $course_format = null,
        ?bool $enable_completion = null,
        ?int $start_date = null,
        ?int $end_date = null
    ): array {
        [
            'course_id' => $courseid,
            'fullname' => $fullname,
            'shortname' => $shortname,
            'visible' => $visible,
            'summary' => $summary,
            'summary_format' => $summaryformat,
            'course_format' => $courseformat,
            'enable_completion' => $enablecompletion,
            'start_date' => $startdate,
            'end_date' => $enddate,
        ] = self::validate_parameters(self::execute_parameters(), [
            'course_id' => $course_id,
            'fullname' => $fullname,
            'shortname' => $shortname,
            'visible' => $visible,
            'summary' => $summary,
            'summary_format' => $summary_format,
            'course_format' => $course_format,
            'enable_completion' => $enable_completion,
            'start_date' => $start_date,
            'end_date' => $end_date,
        ]);

        $systemcontext = \context_system::instance();
        self::validate_context($systemcontext);
        require_capability('local/moodlia:useapi', $systemcontext);

        $course = course_tools::get_course((int) $courseid);
        $coursecontext = \context_course::instance($course->id);
        self::validate_context($coursecontext);
        require_capability('moodle/course:update', $coursecontext);

        return update_course_operation::execute(
            (int) $courseid,
            $fullname,
            $shortname,
            $visible,
            $summary,
            $summaryformat,
            $courseformat,
            $enablecompletion === null ? null : (bool) $enablecompletion,
            $startdate === null ? null : (int) $startdate,
            $enddate === null ? null : (int) $enddate
        );
    }

    /**
     * Define output structure.
     *
     * @return external_single_structure
     */
    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'course_id' => new external_value(PARAM_INT, 'Moodle course id'),
            'shortname' => new external_value(PARAM_TEXT, 'Course short name'),
            'fullname' => new external_value(PARAM_TEXT, 'Course full name'),
            'category_id' => new external_value(PARAM_INT, 'Course category id'),
            'visible' => new external_value(PARAM_BOOL, 'Whether the course is visible'),
            'summary' => new external_value(PARAM_RAW, 'Rendered course summary'),
            'summary_format' => new external_value(PARAM_ALPHA, 'Course summary format'),
            'format' => new external_value(PARAM_PLUGIN, 'Moodle course format plugin name'),
            'enable_completion' => new external_value(PARAM_BOOL, 'Whether course completion tracking is enabled'),
            'start_date' => new external_value(PARAM_INT, 'Course start Unix timestamp'),
            'end_date' => new external_value(PARAM_INT, 'Course end Unix timestamp'),
            'url' => new external_value(PARAM_URL, 'Course URL'),
        ]);
    }
}
