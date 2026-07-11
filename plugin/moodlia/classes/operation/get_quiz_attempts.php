<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * List quiz attempts operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Lists Moodle quiz attempts for a user.
 */
class get_quiz_attempts {
    /**
     * Execute the operation.
     *
     * @param int $quizmoduleid Quiz course module id.
     * @param int $userid Moodle user id, or 0 for current user.
     * @param string $status Attempt status: all, finished, or unfinished.
     * @param bool $includepreviews Include preview attempts.
     * @return array
     */
    public static function execute(
        int $quizmoduleid,
        int $userid = 0,
        string $status = 'all',
        bool $includepreviews = true
    ): array {
        return question_quiz_attempt_tools::get_quiz_attempts($quizmoduleid, $userid, $status, $includepreviews);
    }
}
