<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Delete module operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

use core_courseformat\formatactions;

/**
 * Deletes a Moodle course module through Moodle core APIs.
 */
class delete_module {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $moduleid Course module id.
     * @return array
     */
    public static function execute(int $courseid, int $moduleid): array {
        module_tools::require_module_api();

        $course = course_tools::get_course($courseid);
        $cm = module_tools::get_course_module($course, $moduleid);

        formatactions::cm($course->id)->delete((int) $cm->id, false);
        rebuild_course_cache($course->id, true);

        return [
            'deleted' => true,
            'id' => (int) $cm->id,
        ];
    }
}
