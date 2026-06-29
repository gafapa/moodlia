<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Update wiki page operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Updates a Moodle wiki page through Moodle external APIs.
 */
class update_wiki_page {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $moduleid Wiki course module id.
     * @param int $pageid Wiki page id.
     * @param string $content Page content.
     * @param string|null $section Optional page section.
     * @return array
     */
    public static function execute(int $courseid, int $moduleid, int $pageid, string $content, ?string $section = null): array {
        wiki_tools::require_wiki_api();

        $course = course_tools::get_course($courseid);
        $cm = wiki_tools::get_wiki_module($course, $moduleid);
        wiki_tools::get_page($cm, $pageid);

        \mod_wiki_external::edit_page($pageid, $content, $section);
        $page = wiki_tools::get_page($cm, $pageid);

        return wiki_tools::page_to_response($cm, $page);
    }
}
