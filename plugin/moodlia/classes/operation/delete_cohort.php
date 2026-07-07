<?php
// This file is part of Moodle - https://moodle.org/

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Delete a Moodle cohort.
 */
class delete_cohort {
    public static function execute(int $cohortid): array {
        admin_tools::require_cohort_api();
        $cohort = admin_tools::get_cohort($cohortid);
        cohort_delete_cohort($cohort);

        return [
            'deleted' => true,
            'id' => $cohortid,
        ];
    }
}
