<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Get course forums operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Lists Forum activities in a Moodle course through Moodle Forum external APIs.
 */
class get_course_forums {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @return array
     */
    public static function execute(int $courseid): array {
        forum_tools::require_forum_api();

        $course = course_tools::get_course($courseid);
        $forums = \mod_forum_external::get_forums_by_courses([(int) $course->id]);

        return forum_tools::course_forums_to_response($course, (array) $forums);
    }
}
