<?php

namespace local_moodlia\external;

defined('MOODLE_INTERNAL') || die();

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;
use local_moodlia\operation\copy_course_structure as copy_course_structure_operation;

/**
 * External API adapter for copy_course_structure.
 */
class copy_course_structure extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'source_course_id' => new external_value(PARAM_INT, 'Source Moodle course id'),
            'target_course_id' => new external_value(PARAM_INT, 'Target Moodle course id'),
            'include_contents' => new external_value(PARAM_BOOL, 'Copy section and module shells', VALUE_DEFAULT, true),
            'include_groups' => new external_value(PARAM_BOOL, 'Copy course groups', VALUE_DEFAULT, false),
        ]);
    }

    public static function execute(
        int $source_course_id,
        int $target_course_id,
        bool $include_contents = true,
        bool $include_groups = false
    ): array {
        [
            'source_course_id' => $sourcecourseid,
            'target_course_id' => $targetcourseid,
            'include_contents' => $includecontents,
            'include_groups' => $includegroups,
        ] = self::validate_parameters(self::execute_parameters(), [
            'source_course_id' => $source_course_id,
            'target_course_id' => $target_course_id,
            'include_contents' => $include_contents,
            'include_groups' => $include_groups,
        ]);

        $systemcontext = \context_system::instance();
        self::validate_context($systemcontext);
        require_capability('local/moodlia:useapi', $systemcontext);

        $sourcecontext = \context_course::instance($sourcecourseid);
        self::validate_context($sourcecontext);
        require_capability('moodle/course:view', $sourcecontext);

        $targetcontext = \context_course::instance($targetcourseid);
        self::validate_context($targetcontext);
        if ($includecontents) {
            require_capability('moodle/course:manageactivities', $targetcontext);
        }
        if ($includegroups) {
            require_capability('moodle/course:managegroups', $targetcontext);
        }

        return copy_course_structure_operation::execute(
            (int) $sourcecourseid,
            (int) $targetcourseid,
            (bool) $includecontents,
            (bool) $includegroups
        );
    }

    public static function execute_returns(): external_single_structure {
        return course_workflow_response::copied_structure();
    }
}
