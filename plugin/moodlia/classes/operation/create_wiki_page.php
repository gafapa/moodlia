<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Create wiki page operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Creates a Moodle wiki page through Moodle external APIs.
 */
class create_wiki_page {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $moduleid Wiki course module id.
     * @param string $title Page title.
     * @param string $content Page content.
     * @param string $contentformat Wiki content format.
     * @param int $groupid Group id.
     * @param int $userid User id.
     * @return array
     */
    public static function execute(
        int $courseid,
        int $moduleid,
        string $title,
        string $content,
        string $contentformat = 'html',
        int $groupid = -1,
        int $userid = 0
    ): array {
        wiki_tools::require_wiki_api();

        $course = course_tools::get_course($courseid);
        $cm = wiki_tools::get_wiki_module($course, $moduleid);
        $contentformat = wiki_tools::validate_content_format($contentformat);

        $result = \mod_wiki_external::new_page($title, $content, $contentformat, null, (int) $cm->instance, $userid, $groupid);
        $page = wiki_tools::get_page($cm, (int) $result['pageid']);

        return wiki_tools::page_to_response($cm, $page);
    }
}
