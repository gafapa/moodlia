<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Move book chapter operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Moves a Moodle Book chapter.
 */
class move_book_chapter {
    /**
     * Execute the operation.
     *
     * @param int $courseid Moodle course id.
     * @param int $moduleid Book course module id.
     * @param int $chapterid Book chapter id.
     * @param int|null $afterchapterid Destination chapter id, 0 for first, null for last.
     * @return array
     */
    public static function execute(int $courseid, int $moduleid, int $chapterid, ?int $afterchapterid = null): array {
        book_tools::require_book_api();

        $course = course_tools::get_course($courseid);
        $cm = book_tools::get_book_module($course, $moduleid);
        $book = book_chapter_tools::get_book_record($cm);

        return book_chapter_tools::move_chapter($book, $cm, $chapterid, $afterchapterid);
    }
}
