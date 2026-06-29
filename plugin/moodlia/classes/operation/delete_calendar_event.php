<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Delete course calendar event operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Deletes a Moodle course calendar event.
 */
class delete_calendar_event {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $eventid Moodle calendar event id.
     * @return array
     */
    public static function execute(int $courseid, int $eventid): array {
        $event = calendar_tools::get_course_event($eventid, $courseid);
        $event->delete(false);

        return [
            'deleted' => true,
            'id' => $eventid,
        ];
    }
}
