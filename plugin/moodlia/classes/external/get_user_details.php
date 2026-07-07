<?php
// This file is part of Moodle - https://moodle.org/

namespace local_moodlia\external;

defined('MOODLE_INTERNAL') || die();

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_value;
use local_moodlia\operation\get_user_details as get_user_details_operation;

class get_user_details extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'user_id' => new external_value(PARAM_INT, 'Moodle user id'),
        ]);
    }

    public static function execute(int $user_id): array {
        ['user_id' => $userid] = self::validate_parameters(self::execute_parameters(), ['user_id' => $user_id]);

        $systemcontext = \context_system::instance();
        self::validate_context($systemcontext);
        require_capability('local/moodlia:useapi', $systemcontext);
        require_capability('moodle/user:viewdetails', $systemcontext);

        return get_user_details_operation::execute((int) $userid);
    }

    public static function execute_returns() {
        return admin_response::user_structure();
    }
}
