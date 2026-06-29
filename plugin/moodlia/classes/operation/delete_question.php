<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Delete question operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Deletes or hides a Moodle question through Moodle question APIs.
 */
class delete_question {
    /**
     * Execute the operation.
     *
     * @param int $questionid Question id.
     * @return array
     */
    public static function execute(int $questionid): array {
        return question_tools::delete_question($questionid);
    }
}
