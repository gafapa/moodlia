<?php
// This file is part of Moodle - https://moodle.org/

namespace local_moodlia\external;

defined('MOODLE_INTERNAL') || die();

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_value;
use local_moodlia\operation\create_user as create_user_operation;

class create_user extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'username' => new external_value(PARAM_USERNAME, 'Username'),
            'firstname' => new external_value(PARAM_TEXT, 'First name'),
            'lastname' => new external_value(PARAM_TEXT, 'Last name'),
            'email' => new external_value(PARAM_EMAIL, 'Email address'),
            'password' => new external_value(PARAM_RAW, 'Initial password'),
            'auth' => new external_value(PARAM_ALPHANUMEXT, 'Authentication plugin', VALUE_DEFAULT, 'manual'),
            'suspended' => new external_value(PARAM_BOOL, 'Create the user suspended', VALUE_DEFAULT, false),
        ]);
    }

    public static function execute(
        string $username,
        string $firstname,
        string $lastname,
        string $email,
        string $password,
        string $auth = 'manual',
        bool $suspended = false
    ): array {
        $params = self::validate_parameters(self::execute_parameters(), [
            'username' => $username,
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
        require_capability('moodle/user:create', $systemcontext);

        return create_user_operation::execute(
            $params['username'],
            $params['firstname'],
            $params['lastname'],
            $params['email'],
            $params['password'],
            $params['auth'],
            (bool) $params['suspended']
        );
    }

    public static function execute_returns() {
        return admin_response::user_structure();
    }
}
