<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Create glossary entry operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Creates a Moodle glossary entry through Moodle external APIs.
 */
class create_glossary_entry {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $moduleid Glossary course module id.
     * @param string $concept Entry concept.
     * @param string $definition Entry definition.
     * @param string $definitionformat Public definition format.
     * @param array $options Entry options.
     * @return array
     */
    public static function execute(
        int $courseid,
        int $moduleid,
        string $concept,
        string $definition,
        string $definitionformat = 'html',
        array $options = []
    ): array {
        glossary_tools::require_glossary_api();

        $course = course_tools::get_course($courseid);
        $cm = glossary_tools::get_glossary_module($course, $moduleid);
        $concept = trim($concept);
        if ($concept === '') {
            throw new \invalid_parameter_exception('concept is required.');
        }

        $result = \mod_glossary_external::add_entry(
            (int) $cm->instance,
            $concept,
            $definition,
            glossary_tools::format_to_constant($definitionformat),
            glossary_tools::options_to_external($options)
        );

        $entry = glossary_tools::get_entry($cm, (int) $result['entryid']);
        return glossary_tools::entry_to_response($cm, $entry);
    }
}
