<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Get feedback access information operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Returns access and status flags for a Moodle Feedback activity.
 */
class get_feedback_access_information {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $moduleid Feedback course module id.
     * @return array
     */
    public static function execute(int $courseid, int $moduleid): array {
        feedback_tools::require_feedback_api();

        $course = course_tools::get_course($courseid);
        $cm = feedback_tools::get_feedback_module($course, $moduleid);
        $result = \mod_feedback_external::get_feedback_access_information((int) $cm->instance, 0);

        return feedback_tools::access_to_response($cm, $result);
    }
}
