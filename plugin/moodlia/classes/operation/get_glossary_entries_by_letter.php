<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Get Glossary entries by letter operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Lists Glossary entries by letter through Moodle Glossary external APIs.
 */
class get_glossary_entries_by_letter {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $moduleid Glossary course module id.
     * @param string $letter Letter, ALL, or SPECIAL.
     * @param int $from Offset.
     * @param int $limit Limit.
     * @param bool $includenotapproved Include non-approved entries where allowed.
     * @return array
     */
    public static function execute(
        int $courseid,
        int $moduleid,
        string $letter = 'ALL',
        int $from = 0,
        int $limit = 20,
        bool $includenotapproved = false
    ): array {
        glossary_tools::require_glossary_api();

        $course = course_tools::get_course($courseid);
        $cm = glossary_tools::get_glossary_module($course, $moduleid);
        $result = \mod_glossary_external::get_entries_by_letter(
            (int) $cm->instance,
            $letter,
            max(0, $from),
            max(1, $limit),
            ['includenotapproved' => $includenotapproved]
        );

        return glossary_tools::entries_result_to_response($cm, $result);
    }
}
