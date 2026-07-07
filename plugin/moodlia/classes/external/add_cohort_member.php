<?php
// This file is part of Moodle - https://moodle.org/

namespace local_moodlia\external;

defined('MOODLE_INTERNAL') || die();

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;
use local_moodlia\operation\add_cohort_member as add_cohort_member_operation;

class add_cohort_member extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'cohort_id' => new external_value(PARAM_INT, 'Moodle cohort id'),
            'user_id' => new external_value(PARAM_INT, 'Moodle user id'),
        ]);
    }

    public static function execute(int $cohort_id, int $user_id): array {
        $params = self::validate_parameters(self::execute_parameters(), [
            'cohort_id' => $cohort_id,
            'user_id' => $user_id,
        ]);

        $systemcontext = \context_system::instance();
        self::validate_context($systemcontext);
        require_capability('local/moodlia:useapi', $systemcontext);
        require_capability('moodle/cohort:manage', $systemcontext);

        return add_cohort_member_operation::execute((int) $params['cohort_id'], (int) $params['user_id']);
    }

    public static function execute_returns(): external_single_structure {
        return self::membership_structure();
    }

    public static function membership_structure(): external_single_structure {
        return new external_single_structure([
            'cohort_id' => new external_value(PARAM_INT, 'Moodle cohort id'),
            'user_id' => new external_value(PARAM_INT, 'Moodle user id'),
            'member' => new external_value(PARAM_BOOL, 'Whether the user is a cohort member'),
        ]);
    }
}
