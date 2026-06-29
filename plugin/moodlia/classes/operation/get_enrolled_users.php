<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Enrolled users operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Returns users enrolled in a Moodle course.
 */
class get_enrolled_users {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @return array
     */
    public static function execute(int $courseid): array {
        $course = course_tools::get_course($courseid);
        $context = \context_course::instance($course->id);

        enrolment_tools::require_enrolment_api();
        $users = get_enrolled_users(
            $context,
            '',
            0,
            'u.id,u.username,u.firstname,u.lastname,u.email',
            null,
            0,
            0,
            true
        );

        $records = [];
        foreach ($users as $user) {
            $records[] = enrolment_tools::user_to_response($context, $user);
        }

        return [
            'course_id' => (int) $course->id,
            'users' => $records,
        ];
    }
}
