<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Grade categories operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Returns Moodle gradebook categories for a course.
 */
class get_grade_categories {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @return array
     */
    public static function execute(int $courseid): array {
        gradebook_tools::require_gradebook_api();

        $course = course_tools::get_course($courseid);
        $categories = \grade_category::fetch_all(['courseid' => (int) $course->id]) ?: [];
        $items = [];

        foreach ($categories as $category) {
            $items[] = gradebook_tools::grade_category_to_response($category);
        }

        return [
            'course_id' => (int) $course->id,
            'categories' => $items,
        ];
    }
}
