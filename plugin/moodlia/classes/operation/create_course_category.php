<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Create course category operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Creates a Moodle course category.
 */
class create_course_category {
    /**
     * Execute the operation.
     *
     * @param string $name Category name.
     * @param int $parentid Parent category id, or 0 for top level.
     * @param bool $visible Whether the category is visible.
     * @return array
     */
    public static function execute(string $name, int $parentid = 0, bool $visible = true): array {
        course_tools::require_course_api();

        $name = trim($name);
        if ($name === '') {
            throw new \invalid_parameter_exception('name is required.');
        }

        if ($parentid > 0) {
            course_tools::get_category($parentid);
        }

        $category = \core_course_category::create([
            'name' => $name,
            'parent' => max(0, $parentid),
            'visible' => $visible ? 1 : 0,
        ]);

        return course_tools::category_to_response($category);
    }
}
