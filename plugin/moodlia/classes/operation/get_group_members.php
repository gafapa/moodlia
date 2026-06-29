<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Group members operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Returns members of a Moodle course group.
 */
class get_group_members {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $groupid Moodle group id.
     * @return array
     */
    public static function execute(int $courseid, int $groupid): array {
        $course = course_tools::get_course($courseid);
        $group = group_tools::get_group((int) $course->id, $groupid);

        return [
            'course_id' => (int) $course->id,
            'group_id' => (int) $group->id,
            'members' => group_tools::get_members((int) $group->id),
        ];
    }
}
