<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Start quiz attempt operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Starts a Moodle quiz attempt or preview for the current user.
 */
class start_quiz_attempt {
    /**
     * Execute the operation.
     *
     * @param int $quizmoduleid Quiz course module id.
     * @param bool $forcenew Force a new attempt when Moodle permits it.
     * @return array
     */
    public static function execute(int $quizmoduleid, bool $forcenew = false): array {
        return question_quiz_attempt_tools::start_quiz_attempt($quizmoduleid, $forcenew);
    }
}
