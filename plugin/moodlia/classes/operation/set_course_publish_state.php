<?php

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Set a course publishing state.
 */
class set_course_publish_state {
    public static function execute(int $courseid, string $publishstate): array {
        $publishstate = course_workflow_tools::normalise_publish_state($publishstate);
        $course = course_tools::get_course($courseid);
        $startdate = (int) ($course->startdate ?? 0);
        $enddate = (int) ($course->enddate ?? 0);
        if ($publishstate === 'archived' && $enddate === 0) {
            $enddate = time();
            if ($startdate > 0 && $enddate <= $startdate) {
                $enddate = $startdate + 1;
            }
        }

        $updated = update_course::execute(
            $courseid,
            null,
            null,
            course_workflow_tools::visible_for_state($publishstate),
            null,
            null,
            null,
            null,
            null,
            null,
            $publishstate === 'archived' ? $enddate : null
        );

        return [
            'course_id' => $courseid,
            'publish_state' => $publishstate,
            'visible' => (bool) $updated['visible'],
            'course_json' => course_workflow_tools::encode_json($updated),
        ];
    }
}
