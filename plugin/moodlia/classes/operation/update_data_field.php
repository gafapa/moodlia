<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Update database field operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Updates a Moodle Database activity field through Moodle APIs.
 */
class update_data_field {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $moduleid Database course module id.
     * @param int $fieldid Database field id.
     * @param string $name Field name.
     * @param string $description Field description.
     * @param bool $required Whether the field is required.
     * @param array $options Field options.
     * @return array
     */
    public static function execute(
        int $courseid,
        int $moduleid,
        int $fieldid,
        string $name,
        string $description = '',
        bool $required = false,
        array $options = []
    ): array {
        data_tools::require_data_api();

        $course = course_tools::get_course($courseid);
        $cm = data_tools::get_data_module($course, $moduleid);

        return data_tools::update_field($course, $cm, $fieldid, $name, $description, $required, $options);
    }
}
