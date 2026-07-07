<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Create Lesson page external function.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\external;

defined('MOODLE_INTERNAL') || die();

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;
use local_moodlia\operation\create_lesson_page as create_lesson_page_operation;
use local_moodlia\operation\lesson_tools;

/**
 * External API adapter for create_lesson_page.
 */
class create_lesson_page extends external_api {
    /**
     * Define input parameters.
     *
     * @return external_function_parameters
     */
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'course_id' => new external_value(PARAM_INT, 'Moodle course id'),
            'module_id' => new external_value(PARAM_INT, 'Lesson course module id'),
            'title' => new external_value(PARAM_RAW, 'Lesson page title'),
            'content' => new external_value(PARAM_RAW, 'Lesson page content'),
            'content_format' => new external_value(PARAM_INT, 'Moodle content format', VALUE_DEFAULT, FORMAT_HTML),
            'branches' => new external_value(PARAM_RAW, 'JSON object with a branches array'),
            'after_page_id' => new external_value(PARAM_INT, 'Insert after this Lesson page id, or 0 for first', VALUE_DEFAULT, 0),
            'display_in_menu' => new external_value(PARAM_BOOL, 'Whether the page appears in the Lesson menu', VALUE_DEFAULT, true),
            'horizontal' => new external_value(PARAM_BOOL, 'Whether branch buttons use horizontal layout', VALUE_DEFAULT, true),
        ]);
    }

    /**
     * Execute the external function.
     *
     * @param int $course_id Moodle course id.
     * @param int $module_id Lesson course module id.
     * @param string $title Lesson page title.
     * @param string $content Lesson page content.
     * @param int $content_format Moodle text format.
     * @param string $branches JSON branch definitions.
     * @param int $after_page_id Previous page id.
     * @param bool $display_in_menu Menu display setting.
     * @param bool $horizontal Branch layout setting.
     * @return array
     */
    public static function execute(
        int $course_id,
        int $module_id,
        string $title,
        string $content,
        int $content_format,
        string $branches,
        int $after_page_id = 0,
        bool $display_in_menu = true,
        bool $horizontal = true
    ): array {
        [
            'course_id' => $courseid,
            'module_id' => $moduleid,
            'title' => $title,
            'content' => $content,
            'content_format' => $contentformat,
            'branches' => $branchesjson,
            'after_page_id' => $afterpageid,
            'display_in_menu' => $displayinmenu,
            'horizontal' => $horizontal,
        ] = self::validate_parameters(self::execute_parameters(), [
            'course_id' => $course_id,
            'module_id' => $module_id,
            'title' => $title,
            'content' => $content,
            'content_format' => $content_format,
            'branches' => $branches,
            'after_page_id' => $after_page_id,
            'display_in_menu' => $display_in_menu,
            'horizontal' => $horizontal,
        ]);

        $systemcontext = \context_system::instance();
        self::validate_context($systemcontext);
        require_capability('local/moodlia:useapi', $systemcontext);

        $course = get_course($courseid);
        $cm = lesson_tools::get_lesson_module($course, (int) $moduleid);
        $modulecontext = \context_module::instance($cm->id);
        self::validate_context($modulecontext);
        require_capability('mod/lesson:manage', $modulecontext);

        return create_lesson_page_operation::execute(
            (int) $courseid,
            (int) $moduleid,
            (string) $title,
            (string) $content,
            (int) $contentformat,
            (string) $branchesjson,
            (int) $afterpageid,
            (bool) $displayinmenu,
            (bool) $horizontal
        );
    }

    /**
     * Define output structure.
     *
     * @return external_single_structure
     */
    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'created' => new external_value(PARAM_BOOL, 'Whether the page was created'),
            'page' => lesson_page_response::page_structure(),
        ]);
    }
}
