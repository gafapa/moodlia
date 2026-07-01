<?php

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Create a course from a portable MoodlIA blueprint.
 */
class create_course_from_blueprint {
    public static function execute(array $blueprint, ?callable $coursewritevalidator = null): array {
        return course_workflow_tools::create_from_blueprint($blueprint, $coursewritevalidator);
    }
}
