<?php
// This file is part of Moodle - https://moodle.org/

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Delete a Moodle user through Moodle's user API.
 */
class delete_user {
    public static function execute(int $userid): array {
        admin_tools::require_user_api();
        $user = admin_tools::get_user($userid);
        delete_user($user);

        return [
            'deleted' => true,
            'id' => $userid,
        ];
    }
}
