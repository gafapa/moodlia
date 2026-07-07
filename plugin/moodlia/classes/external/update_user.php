<?php
// This file is part of Moodle - https://moodle.org/

namespace local_moodlia\external;

defined('MOODLE_INTERNAL') || die();

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_value;
use local_moodlia\operation\update_user as update_user_operation;

class update_user extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'user_id' => new external_value(PARAM_INT, 'Moodle user id'),
            'firstname' => new external_value(PARAM_TEXT, 'First name', VALUE_DEFAULT, null, NULL_ALLOWED),
            'lastname' => new external_value(PARAM_TEXT, 'Last name', VALUE_DEFAULT, null, NULL_ALLOWED),
            'email' => new external_value(PARAM_EMAIL, 'Email address', VALUE_DEFAULT, null, NULL_ALLOWED),
            'password' => new external_value(PARAM_RAW, 'New password', VALUE_DEFAULT, null, NULL_ALLOWED),
            'auth' => new external_value(PARAM_ALPHANUMEXT, 'Authentication plugin', VALUE_DEFAULT, null, NULL_ALLOWED),
            'suspended' => new external_value(PARAM_BOOL, 'Whether the user is suspended', VALUE_DEFAULT, null, NULL_ALLOWED),
        ]);
    }

    public static function execute(
        int $user_id,
        ?string $firstname = null,
        ?string $lastname = null,
        ?string $email = null,
        ?string $password = null,
        ?string $auth = null,
        ?bool $suspended = null
    ): array {
        $params = self::validate_parameters(self::execute_parameters(), [
            'user_id' => $user_id,
            'firstname' => $firstname,
            'lastname' => $lastname,
            'email' => $email,
            'password' => $password,
            'auth' => $auth,
            'suspended' => $suspended,
        ]);

        $systemcontext = \context_system::instance();
        self::validate_context($systemcontext);
        require_capability('local/moodlia:useapi', $systemcontext);
        require_capability('moodle/user:update', $systemcontext);

        return update_user_operation::execute((int) $params['user_id'], $params);
    }

    public static function execute_returns() {
        return admin_response::user_structure();
    }
}
