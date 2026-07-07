<?php
// This file is part of Moodle - https://moodle.org/

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Update a Moodle user through Moodle's user API.
 */
class update_user {
    public static function execute(int $userid, array $patch): array {
        admin_tools::require_user_api();
        admin_tools::get_user($userid);

        $user = (object) ['id' => $userid];
        foreach (['firstname', 'lastname', 'email', 'auth'] as $field) {
            if (array_key_exists($field, $patch) && $patch[$field] !== null) {
                $user->{$field} = trim((string) $patch[$field]);
            }
        }
        if (array_key_exists('password', $patch) && $patch['password'] !== null && (string) $patch['password'] !== '') {
            $user->password = (string) $patch['password'];
        }
        if (array_key_exists('suspended', $patch) && $patch['suspended'] !== null) {
            $user->suspended = (bool) $patch['suspended'] ? 1 : 0;
        }

        user_update_user($user, property_exists($user, 'password'), true);
        return admin_tools::user_to_response(admin_tools::get_user($userid));
    }
}
