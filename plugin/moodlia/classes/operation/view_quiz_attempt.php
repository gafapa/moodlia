<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * View quiz attempt operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Registers a Moodle quiz attempt page view.
 */
class view_quiz_attempt {
    /**
     * Execute the operation.
     *
     * @param int $quizmoduleid Quiz course module id.
     * @param int $attemptid Attempt id.
     * @param int $page Attempt page number.
     * @param array $preflightdata Preflight name/value pairs.
     * @return array
     */
    public static function execute(int $quizmoduleid, int $attemptid, int $page = 0, array $preflightdata = []): array {
        return question_quiz_attempt_tools::view_quiz_attempt($quizmoduleid, $attemptid, $page, $preflightdata);
    }
}
