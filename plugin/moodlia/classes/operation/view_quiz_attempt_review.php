<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * View quiz attempt review operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Registers a Moodle quiz attempt review view.
 */
class view_quiz_attempt_review {
    /**
     * Execute the operation.
     *
     * @param int $quizmoduleid Quiz course module id.
     * @param int $attemptid Attempt id.
     * @return array
     */
    public static function execute(int $quizmoduleid, int $attemptid): array {
        return question_quiz_attempt_tools::view_quiz_attempt_review($quizmoduleid, $attemptid);
    }
}
