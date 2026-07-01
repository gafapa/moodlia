<?php

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Copy course structure from one course to another through a MoodlIA blueprint.
 */
class copy_course_structure {
    public static function execute(int $sourcecourseid, int $targetcourseid, bool $includecontents = true, bool $includegroups = false): array {
        if (!$includecontents && !$includegroups) {
            throw new \invalid_parameter_exception('At least one of include_contents or include_groups must be true.');
        }

        $blueprint = course_workflow_tools::export_blueprint($sourcecourseid, $includecontents, $includegroups);
        unset($blueprint['course'], $blueprint['publish_state'], $blueprint['enrolments']);
        $applied = course_workflow_tools::apply_to_course($targetcourseid, $blueprint);

        return [
            'source_course_id' => $sourcecourseid,
            'target_course_id' => $targetcourseid,
            'sections_json' => course_workflow_tools::encode_json($applied['sections']),
            'modules_json' => course_workflow_tools::encode_json($applied['modules']),
            'groups_json' => course_workflow_tools::encode_json($applied['groups']),
            'warnings_json' => course_workflow_tools::encode_json($applied['warnings']),
        ];
    }
}
