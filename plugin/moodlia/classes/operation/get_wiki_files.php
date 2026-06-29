<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Get wiki files operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Lists files attached to a Moodle wiki subwiki through Moodle external APIs.
 */
class get_wiki_files {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $moduleid Wiki course module id.
     * @param int $groupid Group id.
     * @param int $userid User id.
     * @return array
     */
    public static function execute(int $courseid, int $moduleid, int $groupid = -1, int $userid = 0): array {
        wiki_tools::require_wiki_api();

        $course = course_tools::get_course($courseid);
        $cm = wiki_tools::get_wiki_module($course, $moduleid);
        $result = wiki_tools::get_files($cm, $groupid, $userid);

        return [
            'course_id' => (int) $course->id,
            'module_id' => (int) $cm->id,
            'wiki_id' => (int) $cm->instance,
            'group_id' => $groupid,
            'user_id' => $userid,
            'count' => count($result['files']),
            'files' => $result['files'],
            'warnings' => $result['warnings'],
        ];
    }
}
