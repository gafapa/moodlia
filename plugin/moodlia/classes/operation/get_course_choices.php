<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Get course choices operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Lists Choice activities in a Moodle course through Moodle Choice external APIs.
 */
class get_course_choices {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @return array
     */
    public static function execute(int $courseid): array {
        choice_tools::require_choice_api();

        $course = course_tools::get_course($courseid);
        $result = \mod_choice_external::get_choices_by_courses([(int) $course->id]);

        return choice_tools::course_choices_to_response($course, $result);
    }
}
