<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * List question banks operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Lists Moodle question banks exposed by course modules.
 */
class get_question_banks {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param bool $includequizprivate Include quiz-owned private banks.
     * @return array
     */
    public static function execute(int $courseid, bool $includequizprivate = true): array {
        return [
            'banks' => question_tools::get_question_banks($courseid, $includequizprivate),
        ];
    }
}
