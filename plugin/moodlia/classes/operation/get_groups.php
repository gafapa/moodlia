<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Course groups operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Returns groups in a Moodle course.
 */
class get_groups {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @return array
     */
    public static function execute(int $courseid): array {
        $course = course_tools::get_course($courseid);
        group_tools::require_group_api();

        $groups = groups_get_all_groups($course->id, 0, 0, 'g.*');
        $records = [];
        foreach ($groups as $group) {
            $records[] = group_tools::to_response($group);
        }

        return [
            'course_id' => (int) $course->id,
            'groups' => $records,
        ];
    }
}
