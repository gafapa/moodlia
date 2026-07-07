<?php
// This file is part of Moodle - https://moodle.org/

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Return one Moodle user profile.
 */
class get_user_details {
    public static function execute(int $userid): array {
        return admin_tools::user_to_response(admin_tools::get_user($userid));
    }
}
