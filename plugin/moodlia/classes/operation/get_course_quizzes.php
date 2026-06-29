<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Get course quizzes operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Returns Moodle quizzes in selected courses.
 */
class get_course_quizzes {
    /**
     * Execute the operation.
     *
     * @param array $courseids Moodle course ids.
     * @return array
     */
    public static function execute(array $courseids = []): array {
        return question_tools::get_course_quizzes($courseids);
    }
}
