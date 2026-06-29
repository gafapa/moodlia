import { chromium } from '@playwright/test';
import { loadEnvFile, getEnv } from '../tests/helpers/env.mjs';
import { findMoodliaServiceId, loginAsConfiguredAdmin } from './moodle-admin-ui.mjs';

loadEnvFile();

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await loginAsConfiguredAdmin(page);

  const serviceId = await findMoodliaServiceId(page);
  await page.goto(new URL(`/admin/webservice/service_users.php?id=${serviceId}`, getEnv('MOODLE_BASE_URL')).toString());
  await page.waitForLoadState('networkidle');

  const summary = await page.locator('body').evaluate((body) => ({
    title: document.title,
    url: location.href,
    textExcerpt: body.innerText.split('\n').filter((line) => /Admin|admin|Usuario|usuarios|Añadir|Agregar|Autor/i.test(line)).slice(0, 80),
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
      .filter((input) => /admin|Admin|add|remove|user|usuario|select|assign|unassign/i.test(JSON.stringify(input)))
      .slice(0, 120)
  }));

  console.log(JSON.stringify(summary, null, 2));
} finally {
  await browser.close();
}
