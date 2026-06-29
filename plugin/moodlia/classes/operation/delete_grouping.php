<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Delete grouping operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Deletes a Moodle course grouping.
 */
class delete_grouping {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $groupingid Moodle grouping id.
     * @return array
     */
    public static function execute(int $courseid, int $groupingid): array {
        $course = course_tools::get_course($courseid);
        $grouping = group_tools::get_grouping((int) $course->id, $groupingid);

        groups_delete_grouping($grouping);

        return [
            'deleted' => true,
            'id' => (int) $groupingid,
        ];
    }
}
