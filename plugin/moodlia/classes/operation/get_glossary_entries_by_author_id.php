<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Get Glossary entries by author id operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Lists Glossary entries by author id through Moodle Glossary external APIs.
 */
class get_glossary_entries_by_author_id {
    /**
     * Execute the operation.
     *
     * @return array
     */
    public static function execute(
        int $courseid,
        int $moduleid,
        int $authorid,
        string $order = 'CONCEPT',
        string $sort = 'ASC',
        int $from = 0,
        int $limit = 20,
        bool $includenotapproved = false
    ): array {
        glossary_tools::require_glossary_api();

        $course = course_tools::get_course($courseid);
        $cm = glossary_tools::get_glossary_module($course, $moduleid);
        $result = \mod_glossary_external::get_entries_by_author_id(
            (int) $cm->instance,
            $authorid,
            $order,
            $sort,
            max(0, $from),
            max(1, $limit),
            ['includenotapproved' => $includenotapproved]
        );

        return glossary_tools::entries_result_to_response($cm, $result) + ['author_id' => $authorid];
    }
}
