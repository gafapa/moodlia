<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * List choice options operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Lists Moodle choice options through Moodle choice external APIs.
 */
class get_choice_options {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $choicemoduleid Choice course module id.
     * @return array
     */
    public static function execute(int $courseid, int $choicemoduleid): array {
        choice_tools::require_choice_api();
        module_tools::require_module_api();

        $course = course_tools::get_course($courseid);
        $cm = choice_tools::get_choice_module($course, $choicemoduleid);
        $result = \mod_choice_external::get_choice_options((int) $cm->instance);
        $options = (array) ($result['options'] ?? $result);

        return [
            'choice_id' => (int) $cm->instance,
            'choice_module_id' => (int) $cm->id,
            'options' => array_map([choice_tools::class, 'option_to_response'], $options),
        ];
    }
}
