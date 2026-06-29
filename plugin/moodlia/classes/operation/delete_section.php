<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Delete section operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Deletes a Moodle course section through Moodle core APIs.
 */
class delete_section {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int|null $sectionid Course section id.
     * @param int|null $sectionnumber Course section number.
     * @param string $deletemode Delete behavior.
     * @return array
     */
    public static function execute(
        int $courseid,
        ?int $sectionid = null,
        ?int $sectionnumber = null,
        string $deletemode = 'delete'
    ): array {
        $course = section_tools::get_course($courseid);
        $section = section_tools::get_section($course, $sectionid, $sectionnumber);

        if ($deletemode !== 'delete') {
            throw new \invalid_parameter_exception('Only delete_mode=delete is currently supported.');
        }

        if ((int) $section->section === 0 || !course_can_delete_section($course, $section)) {
            throw new \moodle_exception('sectionnotexist');
        }

        $deleted = course_delete_section($course, $section, true, false);
        if ($deleted) {
            rebuild_course_cache($course->id, true);
        }

        return [
            'deleted' => (bool) $deleted,
            'id' => (int) $section->id,
        ];
    }
}
