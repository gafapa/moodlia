<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Upload native Moodle course backup operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Stores an uploaded .mbz backup for later restore.
 */
class upload_course_backup {
    /**
     * Execute the operation.
     *
     * @param string $filename Backup filename.
     * @param string $uploadreference Base64-encoded backup content.
     * @return array
     */
    public static function execute(string $filename, string $uploadreference): array {
        return course_backup_tools::upload_backup_file($filename, $uploadreference);
    }
}
