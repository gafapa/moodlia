<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * List question categories operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Lists Moodle question categories in a selected question bank.
 */
class get_question_categories {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param string|null $bankscope Bank scope.
     * @param int|null $questionbankmoduleid Course qbank module id.
     * @param int|null $quizmoduleid Quiz module id.
     * @param bool $includetop Include the synthetic top category.
     * @return array
     */
    public static function execute(
        int $courseid,
        ?string $bankscope = null,
        ?int $questionbankmoduleid = null,
        ?int $quizmoduleid = null,
        bool $includetop = false
    ): array {
        return [
            'categories' => question_tools::get_question_categories(
                $courseid,
                $bankscope,
                $questionbankmoduleid,
                $quizmoduleid,
                $includetop
            ),
        ];
    }
}
