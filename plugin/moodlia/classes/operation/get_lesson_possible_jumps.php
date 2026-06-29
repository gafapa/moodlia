<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Get Lesson possible jumps operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Returns possible Lesson page jumps through Moodle Lesson external APIs.
 */
class get_lesson_possible_jumps {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $moduleid Lesson course module id.
     * @return array
     */
    public static function execute(int $courseid, int $moduleid): array {
        lesson_tools::require_lesson_api();

        $course = course_tools::get_course($courseid);
        $cm = lesson_tools::get_lesson_module($course, $moduleid);
        $result = \mod_lesson_external::get_pages_possible_jumps((int) $cm->instance);

        return lesson_tools::possible_jumps_to_response($cm, $result);
    }
}
