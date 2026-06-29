<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Get Glossary entry operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Reads one Glossary entry through Moodle Glossary external APIs.
 */
class get_glossary_entry {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $moduleid Glossary course module id.
     * @param int $entryid Glossary entry id.
     * @return array
     */
    public static function execute(int $courseid, int $moduleid, int $entryid): array {
        glossary_tools::require_glossary_api();

        $course = course_tools::get_course($courseid);
        $cm = glossary_tools::get_glossary_module($course, $moduleid);
        $result = \mod_glossary_external::get_entry_by_id($entryid);
        $entry = (array) ($result['entry'] ?? []);

        if ((int) ($entry['glossaryid'] ?? 0) !== (int) $cm->instance) {
            throw new \invalid_parameter_exception('entry_id must reference an entry in the selected glossary module.');
        }

        return glossary_tools::entry_to_response($cm, $entry) + [
            'can_delete' => (bool) ($result['permissions']['candelete'] ?? false),
            'can_update' => (bool) ($result['permissions']['canupdate'] ?? false),
            'warnings' => glossary_tools::warnings_to_response($result['warnings'] ?? []),
        ];
    }
}
