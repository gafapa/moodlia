<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Course categories operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Returns Moodle course categories.
 */
class get_course_categories {
    /**
     * Execute the operation.
     *
     * @param int $parentid Parent category id, or -1 for all categories.
     * @return array
     */
    public static function execute(int $parentid = -1): array {
        course_tools::require_course_api();

        $records = [];
        if ($parentid >= 0) {
            $parent = $parentid === 0 ? \core_course_category::top() : course_tools::get_category($parentid);
            foreach ($parent->get_children() as $category) {
                $records[] = course_tools::category_to_response($category);
            }
        } else {
            foreach (\core_course_category::top()->get_children(['recursive' => true]) as $category) {
                $records[] = course_tools::category_to_response($category);
            }
        }

        return [
            'categories' => $records,
        ];
    }
}
