<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Download folder file operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Returns metadata for a file in a Moodle folder activity.
 */
class download_folder_file {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $moduleid Folder course module id.
     * @param int|null $fileid Stored file id.
     * @param string|null $path Filename or relative path.
     * @return array
     */
    public static function execute(int $courseid, int $moduleid, ?int $fileid = null, ?string $path = null): array {
        module_tools::require_module_api();

        $course = course_tools::get_course($courseid);
        $cm = module_file_tools::get_folder_module($course, $moduleid);
        $file = module_file_tools::get_folder_file($cm, $fileid, $path);

        return module_file_tools::folder_file_download_to_response($cm, $file);
    }
}
