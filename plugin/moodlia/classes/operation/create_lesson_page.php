<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Create Lesson page operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Creates a Moodle Lesson content page through Moodle Lesson component APIs.
 */
class create_lesson_page {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $moduleid Lesson course module id.
     * @param string $title Page title.
     * @param string $content Page content.
     * @param int $contentformat Moodle text format.
     * @param string $branchesjson JSON branch definitions.
     * @param int $afterpageid Previous page id or 0 for first.
     * @param bool $displayinmenu Whether the page appears in the Lesson menu.
     * @param bool $horizontal Whether branch buttons are horizontal.
     * @return array
     */
    public static function execute(
        int $courseid,
        int $moduleid,
        string $title,
        string $content,
        int $contentformat,
        string $branchesjson,
        int $afterpageid = 0,
        bool $displayinmenu = true,
        bool $horizontal = true
    ): array {
        lesson_tools::require_lesson_api();

        $course = course_tools::get_course($courseid);
        $cm = lesson_tools::get_lesson_module($course, $moduleid);
        lesson_tools::prepare_page_context($course, $cm);
        $lesson = lesson_tools::get_lesson_object($course, $cm);

        if ($afterpageid > 0) {
            lesson_tools::get_page($lesson, $cm, $afterpageid);
        }

        $context = \context_module::instance($cm->id);
        $properties = lesson_tools::content_page_properties(
            $lesson,
            $title,
            $content,
            $contentformat,
            lesson_tools::decode_branches($branchesjson),
            $afterpageid,
            $displayinmenu,
            $horizontal
        );

        $page = \lesson_page::create($properties, $lesson, $context, get_user_max_upload_file_size($context));
        rebuild_course_cache($course->id, true);

        return [
            'created' => true,
            'page' => lesson_tools::page_to_response($cm, $page),
        ];
    }
}
