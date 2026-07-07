<?php
// This file is part of Moodle - https://moodle.org/

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Assign a supported role archetype in a course context.
 */
class assign_course_role {
    public static function execute(int $courseid, int $userid, string $rolearchetype = 'student'): array {
        admin_tools::require_role_api();

        $course = course_tools::get_course($courseid);
        $context = \context_course::instance((int) $course->id);
        $user = admin_tools::get_user($userid);
        $roleid = admin_tools::resolve_course_role_id($context, $rolearchetype);

        role_assign($roleid, (int) $user->id, $context->id);
        return [
            'course_id' => (int) $course->id,
            'user_id' => (int) $user->id,
            'role_id' => $roleid,
            'role_archetype' => trim($rolearchetype) ?: 'student',
            'assigned' => true,
            'roles' => enrolment_tools::get_user_role_shortnames($context, (int) $user->id),
        ];
    }
}
