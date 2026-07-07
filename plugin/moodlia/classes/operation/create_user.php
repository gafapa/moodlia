<?php
// This file is part of Moodle - https://moodle.org/

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Create a Moodle user through Moodle's user API.
 */
class create_user {
    public static function execute(
        string $username,
        string $firstname,
        string $lastname,
        string $email,
        string $password,
        string $auth = 'manual',
        bool $suspended = false
    ): array {
        global $CFG;

        admin_tools::require_user_api();

        $user = (object) [
            'username' => \core_text::strtolower(trim($username)),
            'firstname' => trim($firstname),
            'lastname' => trim($lastname),
            'email' => trim($email),
            'password' => $password,
            'auth' => trim($auth) ?: 'manual',
            'confirmed' => 1,
            'suspended' => $suspended ? 1 : 0,
            'mnethostid' => $CFG->mnet_localhost_id,
        ];

        if ($user->username === '' || $user->firstname === '' || $user->lastname === '' || $user->email === '') {
            throw new \invalid_parameter_exception('username, firstname, lastname, and email are required.');
        }
        if ($password === '') {
            throw new \invalid_parameter_exception('password is required.');
        }

        $userid = user_create_user($user, true, true);
        return admin_tools::user_to_response(admin_tools::get_user((int) $userid));
    }
}
