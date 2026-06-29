<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Update quiz question slot operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Updates a Moodle quiz question slot through Moodle quiz APIs.
 */
class update_quiz_question_slot {
    /**
     * Execute the operation.
     *
     * @param int $quizmoduleid Quiz course module id.
     * @param int $slot Slot number.
     * @param float $maxmark Slot maximum mark.
     * @return array
     */
    public static function execute(int $quizmoduleid, int $slot, float $maxmark): array {
        return question_tools::update_quiz_question_slot($quizmoduleid, $slot, $maxmark);
    }
}
