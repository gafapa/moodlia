<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Process quiz attempt operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Processes Moodle quiz attempt responses and can finish the attempt.
 */
class process_quiz_attempt {
    /**
     * Execute the operation.
     *
     * @param int $quizmoduleid Quiz course module id.
     * @param int $attemptid Attempt id.
     * @param array $data Attempt response name/value pairs.
     * @param bool $finishattempt Whether to finish the attempt.
     * @param bool $timeup Whether processing is due to timer expiry.
     * @param array $preflightdata Preflight name/value pairs.
     * @return array
     */
    public static function execute(
        int $quizmoduleid,
        int $attemptid,
        array $data = [],
        bool $finishattempt = false,
        bool $timeup = false,
        array $preflightdata = []
    ): array {
        return question_tools::process_quiz_attempt(
            $quizmoduleid,
            $attemptid,
            $data,
            $finishattempt,
            $timeup,
            $preflightdata
        );
    }
}
