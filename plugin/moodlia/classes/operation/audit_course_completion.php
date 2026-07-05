<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Audit course completion operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Audits activity completion settings in a course.
 */
class audit_course_completion {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param bool $includeok Include non-issue module rows.
     * @return array
     */
    public static function execute(int $courseid, bool $includeok = false): array {
        $audit = completion_audit_tools::audit($courseid, $includeok);

        return [
            'course_id' => (int) $audit['course_id'],
            'issue_count' => (int) $audit['issue_count'],
            'repairable_count' => (int) $audit['repairable_count'],
            'issues_json' => course_workflow_tools::encode_json($audit['issues']),
            'ok_json' => course_workflow_tools::encode_json($audit['ok']),
        ];
    }
}
