<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * View quiz operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Registers a Moodle quiz view for the current user.
 */
class view_quiz {
    /**
     * Execute the operation.
     *
     * @param int $quizmoduleid Quiz course module id.
     * @return array
     */
    public static function execute(int $quizmoduleid): array {
        return question_tools::view_quiz($quizmoduleid);
    }
}
