<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Move course operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Moves a Moodle course to another category through Moodle core APIs.
 */
class move_course {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $categoryid Target Moodle course category id.
     * @return array
     */
    public static function execute(int $courseid, int $categoryid): array {
        $course = update_course::execute(
            $courseid,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            $categoryid
        );

        return [
            'course_id' => $course['course_id'],
            'category_id' => $course['category_id'],
            'moved' => true,
            'url' => $course['url'],
        ];
    }
}
