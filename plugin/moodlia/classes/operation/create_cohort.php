<?php
// This file is part of Moodle - https://moodle.org/

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Create a Moodle system cohort.
 */
class create_cohort {
    public static function execute(string $name, string $idnumber = '', string $description = '', bool $visible = true): array {
        admin_tools::require_cohort_api();

        $cohort = (object) [
            'contextid' => \context_system::instance()->id,
            'name' => trim($name),
            'idnumber' => trim($idnumber),
            'description' => $description,
            'descriptionformat' => FORMAT_HTML,
            'visible' => $visible ? 1 : 0,
        ];
        if ($cohort->name === '') {
            throw new \invalid_parameter_exception('name is required.');
        }

        $cohortid = cohort_add_cohort($cohort);
        return admin_tools::cohort_to_response(admin_tools::get_cohort((int) $cohortid));
    }
}
