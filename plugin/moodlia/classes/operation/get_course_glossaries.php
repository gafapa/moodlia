<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Get course glossaries operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Lists Glossary activities in a Moodle course through Moodle Glossary external APIs.
 */
class get_course_glossaries {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @return array
     */
    public static function execute(int $courseid): array {
        glossary_tools::require_glossary_api();

        $course = course_tools::get_course($courseid);
        $result = \mod_glossary_external::get_glossaries_by_courses([(int) $course->id]);

        return glossary_tools::course_glossaries_to_response($course, $result);
    }
}
