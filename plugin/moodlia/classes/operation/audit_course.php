<?php

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Audit a course for operational readiness.
 */
class audit_course {
    public static function execute(int $courseid): array {
        $audit = course_workflow_tools::audit_course($courseid);

        return [
            'course_id' => $courseid,
            'ready' => (bool) $audit['ready'],
            'issue_count' => (int) $audit['issue_count'],
            'issues_json' => course_workflow_tools::encode_json($audit['issues']),
        ];
    }
}
