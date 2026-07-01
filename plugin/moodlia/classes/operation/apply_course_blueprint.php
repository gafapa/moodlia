<?php

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Apply a portable MoodlIA blueprint to an existing course.
 */
class apply_course_blueprint {
    public static function execute(int $courseid, array $blueprint): array {
        $applied = course_workflow_tools::apply_to_course($courseid, $blueprint);

        return [
            'course_id' => $courseid,
            'sections_json' => course_workflow_tools::encode_json($applied['sections']),
            'modules_json' => course_workflow_tools::encode_json($applied['modules']),
            'groups_json' => course_workflow_tools::encode_json($applied['groups']),
            'enrolments_json' => course_workflow_tools::encode_json($applied['enrolments']),
            'warnings_json' => course_workflow_tools::encode_json($applied['warnings']),
        ];
    }
}
