<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Update course category operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Updates a Moodle course category.
 */
class update_course_category {
    /**
     * Execute the operation.
     *
     * @param int $categoryid Moodle course category id.
     * @param string|null $name Category name.
     * @param bool|null $visible Whether the category is visible.
     * @return array
     */
    public static function execute(int $categoryid, ?string $name = null, ?bool $visible = null): array {
        $category = course_tools::get_category($categoryid);
        $data = [
            'id' => (int) $category->id,
        ];

        if ($name !== null) {
            $name = trim($name);
            if ($name === '') {
                throw new \invalid_parameter_exception('name must not be empty.');
            }
            $data['name'] = $name;
        }

        if ($visible !== null) {
            $data['visible'] = $visible ? 1 : 0;
        }

        if (count($data) > 1) {
            $category->update($data);
            $category = course_tools::get_category($categoryid);
        }

        return course_tools::category_to_response($category);
    }
}
