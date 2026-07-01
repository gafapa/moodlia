<?php

namespace local_moodlia\external;

defined('MOODLE_INTERNAL') || die();

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;
use local_moodlia\operation\apply_course_blueprint as apply_course_blueprint_operation;
use local_moodlia\operation\course_workflow_tools;

/**
 * External API adapter for apply_course_blueprint.
 */
class apply_course_blueprint extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'course_id' => new external_value(PARAM_INT, 'Target Moodle course id'),
            'blueprint' => new external_value(PARAM_RAW, 'JSON-encoded MoodlIA course blueprint'),
        ]);
    }

    public static function execute(int $course_id, string $blueprint): array {
        [
            'course_id' => $courseid,
            'blueprint' => $blueprint,
        ] = self::validate_parameters(self::execute_parameters(), [
            'course_id' => $course_id,
            'blueprint' => $blueprint,
        ]);

        $decoded = course_workflow_tools::decode_object($blueprint, 'blueprint');
        self::validate_course_write_context((int) $courseid, $decoded);

        return apply_course_blueprint_operation::execute(
            (int) $courseid,
            $decoded
        );
    }

    public static function execute_returns(): external_single_structure {
        return course_workflow_response::applied_blueprint_structure();
    }

    private static function validate_course_write_context(int $courseid, array $blueprint): void {
        $systemcontext = \context_system::instance();
        self::validate_context($systemcontext);
        require_capability('local/moodlia:useapi', $systemcontext);

        $coursecontext = \context_course::instance($courseid);
        self::validate_context($coursecontext);
        if (!empty($blueprint['sections']) && is_array($blueprint['sections'])) {
            require_capability('moodle/course:manageactivities', $coursecontext);
        }
        if (!empty($blueprint['groups']) && is_array($blueprint['groups'])) {
            require_capability('moodle/course:managegroups', $coursecontext);
        }
        if (!empty($blueprint['enrolments']) && is_array($blueprint['enrolments'])) {
            require_capability('enrol/manual:enrol', $coursecontext);
        }
    }
}
