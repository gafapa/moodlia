<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Add group to grouping operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Adds a Moodle course group to a grouping.
 */
class add_group_to_grouping {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $groupingid Moodle grouping id.
     * @param int $groupid Moodle group id.
     * @return array
     */
    public static function execute(int $courseid, int $groupingid, int $groupid): array {
        $course = course_tools::get_course($courseid);
        $grouping = group_tools::get_grouping((int) $course->id, $groupingid);
        $group = group_tools::get_group((int) $course->id, $groupid);

        groups_assign_grouping((int) $grouping->id, (int) $group->id);

        return [
            'course_id' => (int) $course->id,
            'grouping_id' => (int) $grouping->id,
            'group_id' => (int) $group->id,
            'added' => true,
            'grouping' => group_tools::grouping_to_response($grouping),
            'group' => group_tools::to_response($group),
        ];
    }
}
