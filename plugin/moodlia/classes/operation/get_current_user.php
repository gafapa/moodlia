<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Current user operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Returns safe identity information for the authenticated Moodle user.
 */
class get_current_user {
    /**
     * Execute the operation.
     *
     * @return array
     */
    public static function execute(): array {
        global $CFG, $USER;

        return [
            'id' => (int) $USER->id,
            'username' => (string) $USER->username,
            'fullname' => fullname($USER),
            'site_url' => (string) $CFG->wwwroot,
        ];
    }
}
