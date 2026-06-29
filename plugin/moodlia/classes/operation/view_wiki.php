<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * View wiki operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Registers a Moodle wiki activity view through Moodle external APIs.
 */
class view_wiki {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $moduleid Wiki course module id.
     * @return array
     */
    public static function execute(int $courseid, int $moduleid): array {
        wiki_tools::require_wiki_api();

        $course = course_tools::get_course($courseid);
        $cm = wiki_tools::get_wiki_module($course, $moduleid);
        $result = wiki_tools::view_wiki($cm);

        return [
            'course_id' => (int) $course->id,
            'module_id' => (int) $cm->id,
            'wiki_id' => (int) $cm->instance,
        ] + $result;
    }
}
