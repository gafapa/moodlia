<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Delete course operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Deletes a Moodle course through Moodle core APIs.
 */
class delete_course {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @return array
     */
    public static function execute(int $courseid): array {
        $course = course_tools::get_course($courseid);

        delete_course($course, false);

        return [
            'deleted' => true,
            'id' => (int) $courseid,
        ];
    }
}
