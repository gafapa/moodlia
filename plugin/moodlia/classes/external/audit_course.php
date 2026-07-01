<?php

namespace local_moodlia\external;

defined('MOODLE_INTERNAL') || die();

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;
use local_moodlia\operation\audit_course as audit_course_operation;

/**
 * External API adapter for audit_course.
 */
class audit_course extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'course_id' => new external_value(PARAM_INT, 'Moodle course id'),
        ]);
    }

    public static function execute(int $course_id): array {
        ['course_id' => $courseid] = self::validate_parameters(self::execute_parameters(), [
            'course_id' => $course_id,
        ]);

        $systemcontext = \context_system::instance();
        self::validate_context($systemcontext);
        require_capability('local/moodlia:useapi', $systemcontext);

        $coursecontext = \context_course::instance($courseid);
        self::validate_context($coursecontext);
        require_capability('moodle/course:view', $coursecontext);

        return audit_course_operation::execute((int) $courseid);
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'course_id' => new external_value(PARAM_INT, 'Moodle course id'),
            'ready' => new external_value(PARAM_BOOL, 'Whether the course has no error-level audit issues'),
            'issue_count' => new external_value(PARAM_INT, 'Number of audit issues'),
            'issues_json' => new external_value(PARAM_RAW, 'JSON array with audit issues'),
        ]);
    }
}
