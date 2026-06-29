<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Get assignment submission status operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Returns the current assignment submission status.
 */
class get_assignment_submission_status {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $moduleid Assignment course module id.
     * @param int $userid Moodle user id, or 0 for the current user.
     * @return array
     */
    public static function execute(int $courseid, int $moduleid, int $userid = 0): array {
        module_tools::require_module_api();
        assignment_tools::require_assignment_api();

        $course = course_tools::get_course($courseid);
        $cm = assignment_tools::get_assignment_module($course, $moduleid);

        return assignment_tools::get_submission_status($course, $cm, $userid);
    }
}
