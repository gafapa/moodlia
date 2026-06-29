<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Create database entry operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Creates an entry in a Moodle Database activity through Moodle external APIs.
 */
class create_data_entry {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $moduleid Database course module id.
     * @param array $values Entry values keyed by field name or field id.
     * @param int $groupid Group id.
     * @return array
     */
    public static function execute(int $courseid, int $moduleid, array $values, int $groupid = 0): array {
        data_tools::require_data_api();

        $course = course_tools::get_course($courseid);
        $cm = data_tools::get_data_module($course, $moduleid);
        $data = data_tools::values_to_external($cm, $values);
        $result = \mod_data_external::add_entry((int) $cm->instance, max(0, $groupid), $data);
        $entryid = (int) ($result['newentryid'] ?? 0);
        if ($entryid <= 0) {
            throw new \moodle_exception('noaccess', 'data');
        }

        return data_tools::get_entry($cm, $entryid, true);
    }
}
