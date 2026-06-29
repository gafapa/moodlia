<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Get Lesson pages operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Returns Lesson pages through Moodle Lesson external APIs.
 */
class get_lesson_pages {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $moduleid Lesson course module id.
     * @param string $password Optional Lesson password.
     * @return array
     */
    public static function execute(int $courseid, int $moduleid, string $password = ''): array {
        lesson_tools::require_lesson_api();

        $course = course_tools::get_course($courseid);
        $cm = lesson_tools::get_lesson_module($course, $moduleid);
        $result = \mod_lesson_external::get_pages((int) $cm->instance, $password);

        return lesson_tools::pages_to_response($cm, $result);
    }
}
