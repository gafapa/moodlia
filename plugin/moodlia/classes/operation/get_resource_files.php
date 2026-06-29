<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * List resource files operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Lists files in a Moodle file resource through Moodle File API.
 */
class get_resource_files {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $moduleid Resource course module id.
     * @return array
     */
    public static function execute(int $courseid, int $moduleid): array {
        module_tools::require_module_api();

        $course = course_tools::get_course($courseid);
        $cm = module_file_tools::get_resource_module($course, $moduleid);

        return [
            'files' => module_file_tools::get_resource_files($cm),
        ];
    }
}
