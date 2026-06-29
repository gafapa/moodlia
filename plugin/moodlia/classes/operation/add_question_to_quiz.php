<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Add question to quiz operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Adds a Moodle question to a quiz through Moodle quiz APIs.
 */
class add_question_to_quiz {
    /**
     * Execute the operation.
     *
     * @param int $quizmoduleid Quiz course module id.
     * @param int $questionid Question id.
     * @param int|null $slot Requested slot.
     * @return array
     */
    public static function execute(int $quizmoduleid, int $questionid, ?int $slot = null): array {
        return question_tools::add_question_to_quiz($quizmoduleid, $questionid, $slot);
    }
}
