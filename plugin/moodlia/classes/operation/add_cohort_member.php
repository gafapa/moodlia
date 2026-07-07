<?php
// This file is part of Moodle - https://moodle.org/

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Add a user to a Moodle cohort.
 */
class add_cohort_member {
    public static function execute(int $cohortid, int $userid): array {
        admin_tools::require_cohort_api();
        admin_tools::get_cohort($cohortid);
        admin_tools::get_user($userid);

        cohort_add_member($cohortid, $userid);
        return [
            'cohort_id' => $cohortid,
            'user_id' => $userid,
            'member' => true,
        ];
    }
}
