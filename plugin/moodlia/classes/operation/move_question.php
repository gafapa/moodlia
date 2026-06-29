<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Move question operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Moves a Moodle question through Moodle question APIs.
 */
class move_question {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $questionid Question id.
     * @param int $targetcategoryid Destination question category id.
     * @param string|null $targetbankscope Destination bank scope.
     * @param int|null $targetquestionbankmoduleid Destination course qbank module id.
     * @param int|null $targetquizmoduleid Destination quiz module id.
     * @return array
     */
    public static function execute(
        int $courseid,
        int $questionid,
        int $targetcategoryid,
        ?string $targetbankscope = null,
        ?int $targetquestionbankmoduleid = null,
        ?int $targetquizmoduleid = null
    ): array {
        return question_tools::move_question(
            $courseid,
            $questionid,
            $targetcategoryid,
            $targetbankscope,
            $targetquestionbankmoduleid,
            $targetquizmoduleid
        );
    }
}
