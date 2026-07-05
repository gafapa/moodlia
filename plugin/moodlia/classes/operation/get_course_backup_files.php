<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * List native Moodle course backup files operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Lists .mbz backup files visible to the current user.
 */
class get_course_backup_files {
    /**
     * Execute the operation.
     *
     * @param int $courseid Optional course id.
     * @param bool $includeprivate Include current user's private backup files.
     * @return array
     */
    public static function execute(int $courseid = 0, bool $includeprivate = true): array {
        $result = course_backup_tools::list_backup_files($courseid, $includeprivate);

        return [
            'course_id' => (int) $result['course_id'],
            'count' => (int) $result['count'],
            'files_json' => course_workflow_tools::encode_json($result['files']),
        ];
    }
}
