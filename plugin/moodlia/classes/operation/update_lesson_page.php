<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Update Lesson page operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Updates a Moodle Lesson content page through Moodle Lesson component APIs.
 */
class update_lesson_page {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $moduleid Lesson course module id.
     * @param int $pageid Lesson page id.
     * @param string|null $title Optional page title.
     * @param string|null $content Optional page content.
     * @param int|null $contentformat Optional Moodle text format.
     * @param string|null $branchesjson Optional JSON branch definitions.
     * @param bool|null $displayinmenu Optional menu display setting.
     * @param bool|null $horizontal Optional branch layout setting.
     * @return array
     */
    public static function execute(
        int $courseid,
        int $moduleid,
        int $pageid,
        ?string $title = null,
        ?string $content = null,
        ?int $contentformat = null,
        ?string $branchesjson = null,
        ?bool $displayinmenu = null,
        ?bool $horizontal = null
    ): array {
        lesson_tools::require_lesson_api();

        $course = course_tools::get_course($courseid);
        $cm = lesson_tools::get_lesson_module($course, $moduleid);
        lesson_tools::prepare_page_context($course, $cm);
        $lesson = lesson_tools::get_lesson_object($course, $cm);
        $page = lesson_tools::get_page($lesson, $cm, $pageid);
        $current = $page->properties();

        if ((int) ($current->qtype ?? 0) !== 20) {
            throw new \invalid_parameter_exception('Only Lesson content pages are supported for update_lesson_page.');
        }

        if (
            $title === null &&
            $content === null &&
            $contentformat === null &&
            $branchesjson === null &&
            $displayinmenu === null &&
            $horizontal === null
        ) {
            throw new \invalid_parameter_exception('At least one page field is required.');
        }

        $branches = $branchesjson === null
            ? lesson_tools::branches_from_page($page)
            : lesson_tools::decode_branches($branchesjson);

        $properties = lesson_tools::content_page_properties(
            $lesson,
            $title ?? (string) ($current->title ?? ''),
            $content ?? (string) ($current->contents ?? ''),
            $contentformat ?? (int) ($current->contentsformat ?? FORMAT_HTML),
            $branches,
            0,
            $displayinmenu ?? ((int) ($current->display ?? 0) === 1),
            $horizontal ?? ((int) ($current->layout ?? 0) === 1)
        );

        $context = \context_module::instance($cm->id);
        $page->update($properties, $context, get_user_max_upload_file_size($context));
        rebuild_course_cache($course->id, true);

        return [
            'updated' => true,
            'page' => lesson_tools::page_to_response($cm, \lesson_page::load($pageid, $lesson)),
        ];
    }
}
