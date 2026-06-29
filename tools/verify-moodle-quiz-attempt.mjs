import { chromium, expect } from '@playwright/test';
import { loadEnvFile } from '../tests/helpers/env.mjs';
import { loginAsConfiguredUser } from '../tests/browser/helpers/moodle-ui.mjs';

loadEnvFile();

function readOption(name, fallback = null) {
  const prefix = `--${name}=`;
  const argument = process.argv.find((value) => value.startsWith(prefix));
  return argument ? argument.slice(prefix.length) : fallback;
}

const baseURL = process.env.PLAYWRIGHT_BASE_URL || process.env.MOODLE_BASE_URL;
const cmid = Number(readOption('cmid', process.env.MOODLE_TEST_QUIZ_MODULE_ID));
const debugControls = process.argv.includes('--debug-controls');

if (!baseURL) {
  throw new Error('MOODLE_BASE_URL or PLAYWRIGHT_BASE_URL is required.');
}

if (!Number.isInteger(cmid) || cmid <= 0) {
  throw new Error('A positive --cmid value is required.');
}

const browser = await chromium.launch();
const page = await browser.newPage({ baseURL });

try {
  await loginAsConfiguredUser(page);
  await page.goto(`/mod/quiz/view.php?id=${cmid}`);
  await expect(page.locator('body')).toBeVisible();

  const startControl = page.getByRole('button', {
    name: /attempt|preview|continue|start|intentar|previsualizar|vista previa|continuar|comenzar|resolver/i
  }).first();
  let clickedStart = false;

  if (debugControls) {
    const controls = await page.locator('a, button, input[type="submit"]').evaluateAll((elements) => elements.map((element) => ({
      tag: element.tagName.toLowerCase(),
      text: element.innerText || element.value || element.getAttribute('aria-label') || element.getAttribute('title') || '',
      href: element.href || '',
      visible: !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length)
    })));
    console.log(JSON.stringify({ controls }, null, 2));
  }

  if (await startControl.isVisible().catch(() => false)) {
    await startControl.click();
    clickedStart = true;
    await page.waitForLoadState('domcontentloaded').catch(() => {});
  }

  const modalStart = page.getByRole('button', {
    name: /start attempt|begin attempt|comenzar intento|iniciar intento|empezar intento/i
  }).first();

  if (await modalStart.isVisible().catch(() => false)) {
    await modalStart.click();
    clickedStart = true;
    await page.waitForLoadState('domcontentloaded').catch(() => {});
  }

  await expect(page.locator('body')).not.toContainText(/ninguna de las preguntas tienen una calificaci[oó]n/i);
  await expect(page.locator('body')).not.toContainText(/none of the questions have a grade/i);

  console.log(JSON.stringify({
    ok: true,
    cmid,
    clicked_start: clickedStart,
    url: page.url()
  }, null, 2));
} finally {
  await browser.close();
}
