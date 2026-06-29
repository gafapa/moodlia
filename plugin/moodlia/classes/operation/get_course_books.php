<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Get course books operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Lists Book activities in a Moodle course through Moodle Book external APIs.
 */
class get_course_books {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @return array
     */
    public static function execute(int $courseid): array {
        book_tools::require_book_api();

        $course = course_tools::get_course($courseid);
        $result = \mod_book_external::get_books_by_courses([(int) $course->id]);

        return book_tools::course_books_to_response($course, $result);
    }
}
