import { chromium, expect } from '@playwright/test';
import { loadEnvFile } from '../tests/helpers/env.mjs';
import { loginAsConfiguredUser } from '../tests/browser/helpers/moodle-ui.mjs';

loadEnvFile();

function option(name, fallback = null) {
  const prefix = `--${name}=`;
  const argument = process.argv.find((value) => value.startsWith(prefix));
  return argument ? argument.slice(prefix.length) : fallback;
}

const baseURL = process.env.PLAYWRIGHT_BASE_URL || process.env.MOODLE_BASE_URL;
const sharedCmid = option('shared-cmid');
const sharedCategory = option('shared-category');
const sharedContext = option('shared-context');
const quizCmid = option('quiz-cmid');
const privateCategory = option('private-category');
const privateContext = option('private-context');

if (!baseURL) {
  throw new Error('MOODLE_BASE_URL or PLAYWRIGHT_BASE_URL is required.');
}

const targets = [
  {
    name: 'course_shared',
    url: `/question/edit.php?cmid=${sharedCmid}&category=${sharedCategory},${sharedContext}`
  },
  {
    name: 'quiz_private',
    url: `/question/edit.php?cmid=${quizCmid}&category=${privateCategory},${privateContext}`
  },
  {
    name: 'quiz_question_bank_default',
    url: `/question/edit.php?cmid=${quizCmid}`
  }
];

const browser = await chromium.launch();
const page = await browser.newPage({ baseURL });

try {
  await loginAsConfiguredUser(page);

  const results = [];
  for (const target of targets) {
    await page.goto(target.url);
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    await expect(page.locator('body')).toBeVisible();

    const text = await page.locator('body').innerText();
    const rows = await page.locator('table tbody tr, .que, [data-region="question-bank"] tr').evaluateAll((elements) =>
      elements
        .map((element) => element.innerText)
        .filter((value) => value && value.trim())
        .slice(0, 20)
    ).catch(() => []);

    results.push({
      name: target.name,
      url: page.url(),
      has_truefalse: text.includes('MoodlIA True/False Question'),
      has_multichoice: text.includes('MoodlIA Multiple Choice Question'),
      has_numerical: text.includes('MoodlIA Numerical Question'),
      has_essay: text.includes('MoodlIA Essay Question'),
      has_shortanswer: text.includes('MoodlIA Private Short Answer Question'),
      has_shared_category: text.includes('MoodlIA Generated Questions'),
      has_private_category: text.includes('MoodlIA Quiz Private Questions'),
      count_mentions: [...text.matchAll(/\b\d+\b/g)].slice(0, 30).map((match) => match[0]),
      rows
    });
  }

  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
