<?php
// One-off maintenance helper for generated MoodlIA quiz content.

define('CLI_SCRIPT', true);

chdir('/var/www/html/public');
require_once('config.php');
require_once($CFG->dirroot . '/mod/quiz/locallib.php');

use mod_quiz\quiz_settings;

$options = getopt('', ['cmid:', 'maxmark::']);
$cmid = isset($options['cmid']) ? (int) $options['cmid'] : 0;
$maxmark = isset($options['maxmark']) ? (float) $options['maxmark'] : 1.0;

if ($cmid <= 0) {
    fwrite(STDERR, "Missing required --cmid option.\n");
    exit(1);
}

if ($maxmark <= 0) {
    fwrite(STDERR, "--maxmark must be greater than zero.\n");
    exit(1);
}

\core\session\manager::set_user(get_admin());

$quizobj = quiz_settings::create_for_cmid($cmid);
$quiz = $quizobj->get_quiz();
$course = $quizobj->get_course();
$structure = $quizobj->get_structure();
$questioncount = $structure->get_question_count();
$changed = [];
$unchanged = [];

for ($slotnumber = 1; $slotnumber <= $questioncount; $slotnumber++) {
    $slot = $structure->get_slot_by_number($slotnumber);
    if ((float) $slot->maxmark > 0) {
        $unchanged[] = [
            'slot' => (int) $slot->slot,
            'slot_id' => (int) $slot->id,
            'maxmark' => (float) $slot->maxmark,
        ];
        continue;
    }

    if ($structure->update_slot_maxmark($slot, $maxmark)) {
        $changed[] = [
            'slot' => (int) $slot->slot,
            'slot_id' => (int) $slot->id,
            'maxmark' => $maxmark,
        ];
    }
}

quiz_delete_previews($quiz);
$gradecalculator = $quizobj->get_grade_calculator();
$gradecalculator->recompute_quiz_sumgrades();
$gradecalculator->recompute_all_attempt_sumgrades();
$gradecalculator->recompute_all_final_grades();
quiz_update_grades($quiz, 0, true);
rebuild_course_cache($course->id, true);

echo json_encode([
    'course_id' => (int) $course->id,
    'quiz_id' => (int) $quiz->id,
    'quiz_module_id' => $cmid,
    'changed' => $changed,
    'unchanged' => $unchanged,
], JSON_PRETTY_PRINT) . PHP_EOL;
