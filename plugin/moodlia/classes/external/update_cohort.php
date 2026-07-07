<?php
// This file is part of Moodle - https://moodle.org/

namespace local_moodlia\external;

defined('MOODLE_INTERNAL') || die();

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_value;
use local_moodlia\operation\update_cohort as update_cohort_operation;

class update_cohort extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'cohort_id' => new external_value(PARAM_INT, 'Moodle cohort id'),
            'name' => new external_value(PARAM_TEXT, 'Cohort name', VALUE_DEFAULT, null, NULL_ALLOWED),
            'idnumber' => new external_value(PARAM_RAW, 'Cohort idnumber', VALUE_DEFAULT, null, NULL_ALLOWED),
            'description' => new external_value(PARAM_RAW, 'Cohort description', VALUE_DEFAULT, null, NULL_ALLOWED),
            'visible' => new external_value(PARAM_BOOL, 'Whether the cohort is visible', VALUE_DEFAULT, null, NULL_ALLOWED),
        ]);
    }

    public static function execute(
        int $cohort_id,
        ?string $name = null,
        ?string $idnumber = null,
        ?string $description = null,
        ?bool $visible = null
    ): array {
        $params = self::validate_parameters(self::execute_parameters(), [
            'cohort_id' => $cohort_id,
            'name' => $name,
            'idnumber' => $idnumber,
            'description' => $description,
            'visible' => $visible,
        ]);

        $systemcontext = \context_system::instance();
        self::validate_context($systemcontext);
        require_capability('local/moodlia:useapi', $systemcontext);
        require_capability('moodle/cohort:manage', $systemcontext);

        return update_cohort_operation::execute((int) $params['cohort_id'], $params);
    }

    public static function execute_returns() {
        return admin_response::cohort_structure();
    }
}
