<?php
// This file is part of Moodle - https://moodle.org/

namespace local_moodlia\external;

defined('MOODLE_INTERNAL') || die();

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_value;
use local_moodlia\operation\create_cohort as create_cohort_operation;

class create_cohort extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'name' => new external_value(PARAM_TEXT, 'Cohort name'),
            'idnumber' => new external_value(PARAM_RAW, 'Cohort idnumber', VALUE_DEFAULT, ''),
            'description' => new external_value(PARAM_RAW, 'Cohort description', VALUE_DEFAULT, ''),
            'visible' => new external_value(PARAM_BOOL, 'Whether the cohort is visible', VALUE_DEFAULT, true),
        ]);
    }

    public static function execute(string $name, string $idnumber = '', string $description = '', bool $visible = true): array {
        $params = self::validate_parameters(self::execute_parameters(), [
            'name' => $name,
            'idnumber' => $idnumber,
            'description' => $description,
            'visible' => $visible,
        ]);

        $systemcontext = \context_system::instance();
        self::validate_context($systemcontext);
        require_capability('local/moodlia:useapi', $systemcontext);
        require_capability('moodle/cohort:manage', $systemcontext);

        return create_cohort_operation::execute($params['name'], $params['idnumber'], $params['description'], (bool) $params['visible']);
    }

    public static function execute_returns() {
        return admin_response::cohort_structure();
    }
}
