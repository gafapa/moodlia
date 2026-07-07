<?php
// This file is part of Moodle - https://moodle.org/

namespace local_moodlia\external;

defined('MOODLE_INTERNAL') || die();

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_value;
use local_moodlia\operation\unassign_course_role as unassign_course_role_operation;

class unassign_course_role extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'course_id' => new external_value(PARAM_INT, 'Moodle course id'),
            'user_id' => new external_value(PARAM_INT, 'Moodle user id'),
            'role_archetype' => new external_value(PARAM_ALPHANUMEXT, 'Role archetype', VALUE_DEFAULT, 'student'),
        ]);
    }

    public static function execute(int $course_id, int $user_id, string $role_archetype = 'student'): array {
        $params = self::validate_parameters(self::execute_parameters(), [
            'course_id' => $course_id,
            'user_id' => $user_id,
            'role_archetype' => $role_archetype,
        ]);

        $systemcontext = \context_system::instance();
        self::validate_context($systemcontext);
        require_capability('local/moodlia:useapi', $systemcontext);

        $coursecontext = \context_course::instance((int) $params['course_id']);
        self::validate_context($coursecontext);
        require_capability('moodle/role:assign', $coursecontext);

        return unassign_course_role_operation::execute((int) $params['course_id'], (int) $params['user_id'], $params['role_archetype']);
    }

    public static function execute_returns() {
        return admin_response::role_assignment_structure('unassigned');
    }
}
