<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Save quiz attempt operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Saves current Moodle quiz attempt responses without finishing the attempt.
 */
class save_quiz_attempt {
    /**
     * Execute the operation.
     *
     * @param int $quizmoduleid Quiz course module id.
     * @param int $attemptid Attempt id.
     * @param array $data Attempt response name/value pairs.
     * @param array $preflightdata Preflight name/value pairs.
     * @return array
     */
    public static function execute(
        int $quizmoduleid,
        int $attemptid,
        array $data = [],
        array $preflightdata = []
    ): array {
        return question_quiz_attempt_tools::save_quiz_attempt($quizmoduleid, $attemptid, $data, $preflightdata);
    }
}
