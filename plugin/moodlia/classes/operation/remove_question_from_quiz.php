<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Remove question from quiz operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Removes a Moodle question slot from a quiz activity.
 */
class remove_question_from_quiz {
    /**
     * Execute the operation.
     *
     * @param int $quizmoduleid Quiz course module id.
     * @param int|null $slot Quiz slot number.
     * @param int|null $questionid Question id.
     * @return array
     */
    public static function execute(int $quizmoduleid, ?int $slot = null, ?int $questionid = null): array {
        return question_tools::remove_question_from_quiz($quizmoduleid, $slot, $questionid);
    }
}
