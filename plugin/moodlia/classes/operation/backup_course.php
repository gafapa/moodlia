<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Native Moodle course backup operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Creates a native Moodle .mbz course backup.
 */
class backup_course {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param string $filename Optional backup filename.
     * @param bool $includeusers Include enrolled users and user data.
     * @param bool $includeactivities Include course activities.
     * @param bool $includeblocks Include blocks.
     * @param bool $includefilters Include filters.
     * @param bool $includecomments Include comments.
     * @param bool $includelogs Include logs.
     * @param bool $includegradehistories Include grade histories.
     * @return array
     */
    public static function execute(
        int $courseid,
        string $filename = '',
        bool $includeusers = false,
        bool $includeactivities = true,
        bool $includeblocks = true,
        bool $includefilters = true,
        bool $includecomments = false,
        bool $includelogs = false,
        bool $includegradehistories = false
    ): array {
        return course_backup_tools::backup_course($courseid, [
            'filename' => $filename,
            'users' => $includeusers,
            'role_assignments' => $includeusers,
            'userscompletion' => $includeusers,
            'activities' => $includeactivities,
            'blocks' => $includeblocks,
            'filters' => $includefilters,
            'comments' => $includecomments,
            'logs' => $includelogs,
            'grade_histories' => $includegradehistories,
        ]);
    }
}
