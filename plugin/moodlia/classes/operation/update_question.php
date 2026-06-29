<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Update question operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Updates a Moodle question by creating a new Moodle question version.
 */
class update_question {
    /**
     * Execute the operation.
     *
     * @param int $questionid Question id.
     * @param string|null $name Question name.
     * @param string|null $questiontext Question text.
     * @param array $options Type-specific options.
     * @return array
     */
    public static function execute(int $questionid, ?string $name = null, ?string $questiontext = null, array $options = []): array {
        $existing = question_tools::get_question($questionid);
        $name = $name ?? $existing->name;
        $questiontext = $questiontext ?? $existing->questiontext;

        return question_tools::save_question(
            $questionid,
            (int) get_question_bank_entry((int) $existing->id)->questioncategoryid,
            $existing->qtype,
            $name,
            $questiontext,
            $options
        );
    }
}
