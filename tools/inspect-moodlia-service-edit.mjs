import { chromium } from '@playwright/test';
import { loadEnvFile, getEnv } from '../tests/helpers/env.mjs';
import { findMoodliaServiceId, loginAsConfiguredAdmin } from './moodle-admin-ui.mjs';

loadEnvFile();

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await loginAsConfiguredAdmin(page);

  const serviceId = await findMoodliaServiceId(page);
  await page.goto(new URL(`/admin/webservice/service.php?id=${serviceId}`, getEnv('MOODLE_BASE_URL')).toString());
  await page.waitForLoadState('networkidle');

  const summary = await page.locator('body').evaluate((body) => ({
    title: document.title,
    url: location.href,
    textExcerpt: body.innerText.split('\n').filter((line) => /MoodlIA|Habilitado|Activado|enabled|service|servicio|usuarios|restring/i.test(line)).slice(0, 60),
    controls: [...body.querySelectorAll('input, button, select')]
      .map((input) => ({
        tag: input.tagName.toLowerCase(),
        type: input.getAttribute('type'),
        name: input.getAttribute('name'),
        id: input.getAttribute('id'),
        value: input.getAttribute('value'),
        checked: input.checked,
        text: input.textContent?.trim() ?? '',
        aria: input.getAttribute('aria-label')
      }))
  }));

  console.log(JSON.stringify(summary, null, 2));
} finally {
  await browser.close();
}
