<?php

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Export a course as a portable MoodlIA blueprint.
 */
class export_course_blueprint {
    public static function execute(int $courseid, bool $includecontents = true, bool $includegroups = true): array {
        $blueprint = course_workflow_tools::export_blueprint($courseid, $includecontents, $includegroups);

        return [
            'course_id' => $courseid,
            'blueprint_json' => course_workflow_tools::encode_json($blueprint),
        ];
    }
}
