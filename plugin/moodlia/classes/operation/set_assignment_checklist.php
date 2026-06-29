<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Set assignment checklist operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Creates a binary checklist as a Moodle rubric.
 */
class set_assignment_checklist {
    public static function execute(
        int $courseid,
        int $moduleid,
        string $name,
        string $description,
        string $items
    ): array {
        return assignment_grading_tools::set_checklist($courseid, $moduleid, $name, $description, $items);
    }
}
