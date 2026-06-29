<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Grade assignment with checklist operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Saves an assignment grade using a binary rubric checklist.
 */
class grade_assignment_with_checklist {
    public static function execute(
        int $courseid,
        int $moduleid,
        int $userid,
        string $items,
        string $feedbackcomment = '',
        int $attemptnumber = -1
    ): array {
        return assignment_grading_tools::grade_with_checklist(
            $courseid,
            $moduleid,
            $userid,
            $items,
            $feedbackcomment,
            $attemptnumber
        );
    }
}
