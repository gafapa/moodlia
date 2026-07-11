import { chromium } from '@playwright/test';
import { loadEnvFile, getEnv } from '../tests/helpers/env.mjs';
import { resolveMoodleUrl } from '../client/moodle-rest-client.mjs';

loadEnvFile();

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await page.goto(resolveMoodleUrl(getEnv('MOODLE_BASE_URL'), 'login/index.php').toString());
  if (await page.locator('#username').isVisible().catch(() => false)) {
    await page.locator('#username').fill(getEnv('MOODLE_USERNAME'));
    await page.locator('#password').fill(getEnv('MOODLE_PASSWORD'));
    await page.locator('#loginbtn').click();
    await page.waitForLoadState('networkidle');
  }

  await page.goto(resolveMoodleUrl(getEnv('MOODLE_BASE_URL'), 'admin/webservice/tokens.php').toString());
  await page.waitForLoadState('networkidle');

  const summary = await page.locator('body').evaluate((body) => ({
    title: document.title,
    url: location.href,
    textExcerpt: body.innerText.split('\n').filter((line) => /token|Token|Crear|AÃ±adir|MoodlIA|local_moodlia|Admin|servicio/i.test(line)).slice(0, 100),
    links: [...body.querySelectorAll('a')]
      .map((link) => ({ text: link.textContent?.trim() ?? '', href: link.href }))
      .filter((link) => /token|create|add|crear|aÃ±adir|MoodlIA|local_moodlia/i.test(`${link.text} ${link.href}`))
      .slice(0, 80),
    controls: [...body.querySelectorAll('input, button, select, option')]
      .map((input) => ({
        tag: input.tagName.toLowerCase(),
        type: input.getAttribute('type'),
        name: input.getAttribute('name'),
        id: input.getAttribute('id'),
        value: input.getAttribute('value'),
        text: input.textContent?.trim() ?? '',
        selected: input.selected,
        disabled: input.disabled
      }))
      .filter((input) => /token|create|add|user|service|servicio|MoodlIA|local_moodlia|submit|guardar/i.test(JSON.stringify(input)))
      .slice(0, 120)
  }));

  console.log(JSON.stringify(summary, null, 2));
} finally {
  await browser.close();
}
