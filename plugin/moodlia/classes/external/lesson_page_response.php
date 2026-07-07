<?php
// This file is part of Moodle - https://moodle.org/

namespace local_moodlia\external;

defined('MOODLE_INTERNAL') || die();

use core_external\external_multiple_structure;
use core_external\external_single_structure;
use core_external\external_value;

/**
 * Shared external response structures for Lesson page operations.
 */
class lesson_page_response {
    /**
     * Return a Lesson page response structure.
     *
     * @return external_single_structure
     */
    public static function page_structure(): external_single_structure {
        return new external_single_structure([
            'page_id' => new external_value(PARAM_INT, 'Lesson page id'),
            'lesson_id' => new external_value(PARAM_INT, 'Lesson instance id'),
            'module_id' => new external_value(PARAM_INT, 'Lesson course module id'),
            'previous_page_id' => new external_value(PARAM_INT, 'Previous page id or 0'),
            'next_page_id' => new external_value(PARAM_INT, 'Next page id or 0'),
            'question_type' => new external_value(PARAM_INT, 'Lesson question type'),
            'question_option' => new external_value(PARAM_INT, 'Lesson question option'),
            'layout' => new external_value(PARAM_INT, 'Lesson page layout'),
            'display' => new external_value(PARAM_INT, 'Lesson page display setting'),
            'display_in_menu_block' => new external_value(PARAM_BOOL, 'Whether the page is displayed in the menu block'),
            'type' => new external_value(PARAM_INT, 'Lesson page type'),
            'type_id' => new external_value(PARAM_INT, 'Lesson page type id'),
            'type_string' => new external_value(PARAM_RAW, 'Lesson page type label'),
            'title' => new external_value(PARAM_RAW, 'Lesson page title'),
            'content' => new external_value(PARAM_RAW, 'Lesson page content'),
            'content_format' => new external_value(PARAM_INT, 'Moodle content format'),
            'time_created' => new external_value(PARAM_INT, 'Creation timestamp'),
            'time_modified' => new external_value(PARAM_INT, 'Modification timestamp'),
            'answer_ids' => new external_multiple_structure(new external_value(PARAM_INT, 'Answer id')),
            'jumps' => new external_multiple_structure(new external_value(PARAM_INT, 'Jump page id')),
            'files_count' => new external_value(PARAM_INT, 'Attached file count'),
            'files_size_total' => new external_value(PARAM_INT, 'Attached file size total'),
            'branches_count' => new external_value(PARAM_INT, 'Branch count'),
            'branches' => new external_multiple_structure(new external_single_structure([
                'answer_id' => new external_value(PARAM_INT, 'Lesson answer id'),
                'title' => new external_value(PARAM_RAW, 'Branch title'),
                'title_format' => new external_value(PARAM_INT, 'Branch title format'),
                'response' => new external_value(PARAM_RAW, 'Branch response'),
                'response_format' => new external_value(PARAM_INT, 'Branch response format'),
                'jump_to' => new external_value(PARAM_INT, 'Branch jump target'),
                'score' => new external_value(PARAM_FLOAT, 'Branch score'),
            ])),
        ]);
    }
}
