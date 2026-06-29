<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Delete course category operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Deletes a Moodle course category.
 */
class delete_course_category {
    /**
     * Execute the operation.
     *
     * @param int $categoryid Moodle course category id.
     * @return array
     */
    public static function execute(int $categoryid): array {
        $category = course_tools::get_category($categoryid);
        $category->delete_full(false);

        return [
            'deleted' => true,
            'id' => (int) $categoryid,
        ];
    }
}
