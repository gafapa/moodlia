<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Create question operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Creates a Moodle question through Moodle question APIs.
 */
class create_question {
    /**
     * Execute the operation.
     *
     * @param int $categoryid Question category id.
     * @param string $questiontype Question type.
     * @param string $name Question name.
     * @param string $questiontext Question text.
     * @param array $options Type-specific options.
     * @return array
     */
    public static function execute(int $categoryid, string $questiontype, string $name, string $questiontext, array $options): array {
        return question_tools::save_question(null, $categoryid, $questiontype, $name, $questiontext, $options);
    }
}
