<?php

namespace local_moodlia\external;

defined('MOODLE_INTERNAL') || die();

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;
use local_moodlia\operation\course_workflow_tools;
use local_moodlia\operation\sync_course_enrolments as sync_course_enrolments_operation;

/**
 * External API adapter for sync_course_enrolments.
 */
class sync_course_enrolments extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'course_id' => new external_value(PARAM_INT, 'Moodle course id'),
            'enrolments' => new external_value(PARAM_RAW, 'JSON array of user_id and role_archetype entries'),
            'unenrol_missing' => new external_value(PARAM_BOOL, 'Unenrol currently enrolled users not present in the desired list', VALUE_DEFAULT, false),
        ]);
    }

    public static function execute(int $course_id, string $enrolments, bool $unenrol_missing = false): array {
        [
            'course_id' => $courseid,
            'enrolments' => $enrolments,
            'unenrol_missing' => $unenrolmissing,
        ] = self::validate_parameters(self::execute_parameters(), [
            'course_id' => $course_id,
            'enrolments' => $enrolments,
            'unenrol_missing' => $unenrol_missing,
        ]);

        $systemcontext = \context_system::instance();
        self::validate_context($systemcontext);
        require_capability('local/moodlia:useapi', $systemcontext);

        $coursecontext = \context_course::instance($courseid);
        self::validate_context($coursecontext);
        require_capability('enrol/manual:enrol', $coursecontext);
        if ($unenrolmissing) {
            require_capability('enrol/manual:unenrol', $coursecontext);
        }

        return sync_course_enrolments_operation::execute(
            (int) $courseid,
            course_workflow_tools::decode_array($enrolments, 'enrolments'),
            (bool) $unenrolmissing
        );
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'course_id' => new external_value(PARAM_INT, 'Moodle course id'),
            'enrolled_json' => new external_value(PARAM_RAW, 'JSON array with enrolment results'),
            'unenrolled_json' => new external_value(PARAM_RAW, 'JSON array with unenrolment results'),
            'warnings_json' => new external_value(PARAM_RAW, 'JSON array with skipped enrolments or warnings'),
        ]);
    }
}
