<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Manual user unenrolment operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Unenrol a user from a course manual enrolment instance.
 */
class unenrol_user {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $userid Moodle user id.
     * @return array
     */
    public static function execute(int $courseid, int $userid): array {
        $course = course_tools::get_course($courseid);
        $user = enrolment_tools::get_user($userid);
        $instance = enrolment_tools::get_manual_instance($course);
        $plugin = enrolment_tools::get_manual_plugin();

        $plugin->unenrol_user($instance, (int) $user->id);

        return [
            'course_id' => (int) $course->id,
            'user_id' => (int) $user->id,
            'unenrolled' => true,
        ];
    }
}
