import { chromium } from '@playwright/test';
import { loadEnvFile, getEnv } from '../tests/helpers/env.mjs';

loadEnvFile();

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await page.goto(new URL('/login/index.php', getEnv('MOODLE_BASE_URL')).toString());
  if (await page.locator('#username').isVisible().catch(() => false)) {
    await page.locator('#username').fill(getEnv('MOODLE_USERNAME'));
    await page.locator('#password').fill(getEnv('MOODLE_PASSWORD'));
    await page.locator('#loginbtn').click();
    await page.waitForLoadState('networkidle');
  }

  await page.goto(new URL('/admin/settings.php?section=externalservices', getEnv('MOODLE_BASE_URL')).toString());
  await page.waitForLoadState('networkidle');

  const summary = await page.locator('body').evaluate((body) => {
    const text = body.innerText;
    const links = [...body.querySelectorAll('a')]
      .map((link) => ({ text: link.textContent?.trim() ?? '', href: link.href }))
      .filter((link) => /MoodlIA|local_moodlia|servicio|service|activar|enable|editar|edit|usuario|user/i.test(`${link.text} ${link.href}`));
    const inputs = [...body.querySelectorAll('input, button')]
      .map((input) => ({
        tag: input.tagName.toLowerCase(),
        type: input.getAttribute('type'),
        name: input.getAttribute('name'),
        value: input.getAttribute('value'),
        title: input.getAttribute('title'),
        aria: input.getAttribute('aria-label'),
        text: input.textContent?.trim() ?? '',
        checked: input.checked
      }))
      .filter((input) => /MoodlIA|local_moodlia|enable|enabled|service|servicio|submit|save|guardar/i.test(JSON.stringify(input)));
    return {
      title: document.title,
      url: location.href,
      hasMoodlia: text.includes('MoodlIA'),
      textExcerpt: text.split('\n').filter((line) => /MoodlIA|local_moodlia|Servicio|service|servicio/i.test(line)).slice(0, 30),
      links,
      inputs
    };
  });

  console.log(JSON.stringify(summary, null, 2));
} finally {
  await browser.close();
}
