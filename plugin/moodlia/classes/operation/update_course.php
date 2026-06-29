<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Update course operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Updates a Moodle course through Moodle core APIs.
 */
class update_course {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param string|null $fullname Course full name.
     * @param string|null $shortname Course short name.
     * @param bool|null $visible Whether the course is visible.
     * @param string|null $summary Course summary.
     * @param string|null $summaryformat Public summary format.
     * @param string|null $format Course format plugin name.
     * @param bool|null $enablecompletion Whether course completion tracking is enabled.
     * @param int|null $startdate Course start timestamp.
     * @param int|null $enddate Course end timestamp, or 0.
     * @return array
     */
    public static function execute(
        int $courseid,
        ?string $fullname = null,
        ?string $shortname = null,
        ?bool $visible = null,
        ?string $summary = null,
        ?string $summaryformat = null,
        ?string $format = null,
        ?bool $enablecompletion = null,
        ?int $startdate = null,
        ?int $enddate = null
    ): array {
        $course = course_tools::get_course($courseid);

        $data = (object) ['id' => $course->id];
        $haschanges = false;

        if ($fullname !== null) {
            $fullname = trim($fullname);
            if ($fullname === '') {
                throw new \invalid_parameter_exception('fullname cannot be empty when provided.');
            }
            $data->fullname = $fullname;
            $haschanges = true;
        }

        if ($shortname !== null) {
            $shortname = trim($shortname);
            if ($shortname === '') {
                throw new \invalid_parameter_exception('shortname cannot be empty when provided.');
            }
            $data->shortname = $shortname;
            $haschanges = true;
        }

        if ($visible !== null) {
            $data->visible = $visible ? 1 : 0;
            $haschanges = true;
        }

        if ($summary !== null) {
            $data->summary = $summary;
            $data->summaryformat = course_tools::format_to_constant($summaryformat ?? 'html');
            $haschanges = true;
        } else if ($summaryformat !== null) {
            throw new \invalid_parameter_exception('summary is required when summary_format is provided.');
        }

        if ($format !== null) {
            $data->format = course_tools::normalise_course_format($format);
            $haschanges = true;
        }

        if ($enablecompletion !== null) {
            $data->enablecompletion = $enablecompletion ? 1 : 0;
            $haschanges = true;
        }

        $nextstartdate = $startdate ?? (int) ($course->startdate ?? 0);
        $nextenddate = $enddate ?? (int) ($course->enddate ?? 0);
        if ($startdate !== null || $enddate !== null) {
            course_tools::validate_course_dates($nextstartdate, $nextenddate);
            $data->startdate = $nextstartdate;
            $data->enddate = $nextenddate;
            $haschanges = true;
        }

        if (!$haschanges) {
            throw new \invalid_parameter_exception('At least one course field is required.');
        }

        update_course($data);
        rebuild_course_cache($course->id, true);

        foreach ((array) $data as $field => $value) {
            if ($field !== 'id') {
                $course->$field = $value;
            }
        }

        return course_tools::to_response($course);
    }
}
