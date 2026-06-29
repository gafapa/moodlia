<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Set assignment marking guide operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Creates or updates an assignment marking guide.
 */
class set_assignment_marking_guide {
    public static function execute(
        int $courseid,
        int $moduleid,
        string $name,
        string $description,
        string $criteria,
        string $comments = '{}',
        string $options = '{}'
    ): array {
        return assignment_grading_tools::set_marking_guide(
            $courseid,
            $moduleid,
            $name,
            $description,
            $criteria,
            $comments,
            $options
        );
    }
}
