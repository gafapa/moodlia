<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Delete grade category operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Deletes a Moodle gradebook category.
 */
class delete_grade_category {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $categoryid Grade category id.
     * @return array
     */
    public static function execute(int $courseid, int $categoryid): array {
        $course = course_tools::get_course($courseid);
        $category = gradebook_tools::get_grade_category((int) $course->id, $categoryid);
        $category->delete('local_moodlia');

        return [
            'course_id' => (int) $course->id,
            'category_id' => $categoryid,
            'deleted' => true,
        ];
    }
}
