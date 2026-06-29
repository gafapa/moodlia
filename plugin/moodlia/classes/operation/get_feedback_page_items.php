<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Get feedback page items operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Lists items on one Moodle Feedback activity page through Moodle APIs.
 */
class get_feedback_page_items {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $moduleid Feedback course module id.
     * @param int $page Zero-based feedback page number.
     * @return array
     */
    public static function execute(int $courseid, int $moduleid, int $page = 0): array {
        feedback_tools::require_feedback_api();

        $course = course_tools::get_course($courseid);
        $cm = feedback_tools::get_feedback_module($course, $moduleid);
        $result = feedback_tools::get_page_items($cm, $page);

        return ['course_id' => (int) $course->id] + $result;
    }
}
