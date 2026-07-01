<?php

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Synchronise manual course enrolments.
 */
class sync_course_enrolments {
    public static function execute(int $courseid, array $enrolments, bool $unenrolmissing = false): array {
        course_workflow_tools::validate_enrolments($enrolments);

        $desired = [];
        $enrolled = [];
        $unenrolled = [];
        $warnings = [];

        foreach ($enrolments as $enrolment) {
            $userid = (int) ($enrolment['user_id'] ?? 0);
            $role = (string) ($enrolment['role_archetype'] ?? 'student');
            $desired[$userid] = true;
            try {
                $enrolled[] = enrol_user::execute($courseid, $userid, $role);
            } catch (\Throwable $error) {
                $warnings[] = [
                    'type' => 'enrolment',
                    'user_id' => $userid,
                    'message' => $error->getMessage(),
                ];
            }
        }

        if ($unenrolmissing) {
            foreach (get_enrolled_users::execute($courseid)['users'] as $user) {
                $userid = (int) $user['user_id'];
                if (!isset($desired[$userid])) {
                    try {
                        $unenrolled[] = unenrol_user::execute($courseid, $userid);
                    } catch (\Throwable $error) {
                        $warnings[] = [
                            'type' => 'unenrolment',
                            'user_id' => $userid,
                            'message' => $error->getMessage(),
                        ];
                    }
                }
            }
        }

        return [
            'course_id' => $courseid,
            'enrolled_json' => course_workflow_tools::encode_json($enrolled),
            'unenrolled_json' => course_workflow_tools::encode_json($unenrolled),
            'warnings_json' => course_workflow_tools::encode_json($warnings),
        ];
    }
}
