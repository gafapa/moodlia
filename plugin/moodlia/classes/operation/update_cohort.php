<?php
// This file is part of Moodle - https://moodle.org/

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Update a Moodle cohort.
 */
class update_cohort {
    public static function execute(int $cohortid, array $patch): array {
        admin_tools::require_cohort_api();
        $cohort = admin_tools::get_cohort($cohortid);

        foreach (['name', 'idnumber', 'description'] as $field) {
            if (array_key_exists($field, $patch) && $patch[$field] !== null) {
                $cohort->{$field} = (string) $patch[$field];
            }
        }
        if (array_key_exists('visible', $patch) && $patch['visible'] !== null) {
            $cohort->visible = (bool) $patch['visible'] ? 1 : 0;
        }
        $cohort->descriptionformat = FORMAT_HTML;

        cohort_update_cohort($cohort);
        return admin_tools::cohort_to_response(admin_tools::get_cohort($cohortid));
    }
}
