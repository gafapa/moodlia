import { test, expect } from '@playwright/test';
import {
  expectMoodlePageLoaded,
  getConfiguredCourseIds,
  getConfiguredQuizModuleIds,
  loginAsConfiguredUser
} from './helpers/moodle-ui.mjs';

const hasBrowserConfig = Boolean(process.env.PLAYWRIGHT_BASE_URL || process.env.MOODLE_BASE_URL);
const hasLoginConfig = Boolean(process.env.MOODLE_USERNAME && process.env.MOODLE_PASSWORD);

test.skip(!hasBrowserConfig || !hasLoginConfig, 'Set Moodle URL, MOODLE_USERNAME, and MOODLE_PASSWORD to run browser verification.');

test.beforeEach(async ({ page }) => {
  await loginAsConfiguredUser(page);
});

test('Moodle dashboard is reachable after login', async ({ page }) => {
  await page.goto('/my/');
  await expectMoodlePageLoaded(page);
  await expect(page.locator('body')).toContainText(/Dashboard|Ãrea personal|My courses|Mis cursos/i);
});

test('course index is reachable for multi-course management checks', async ({ page }) => {
  await page.goto('/course/index.php');
  await expectMoodlePageLoaded(page);
  await expect(page.locator('body')).toContainText(/Course|Curso|Categories|CategorÃ­as/i);
});

for (const courseId of getConfiguredCourseIds()) {
  test(`configured course ${courseId} is reachable`, async ({ page }) => {
    await page.goto(`/course/view.php?id=${courseId}`);
    await expectMoodlePageLoaded(page);
    await expect(page).toHaveURL(new RegExp(`/course/view\\.php\\?id=${courseId}(?:&|$)`));
  });
}

for (const quizModuleId of getConfiguredQuizModuleIds()) {
  test(`configured quiz ${quizModuleId} can start preview or attempt`, async ({ page }) => {
    await page.goto(`/mod/quiz/view.php?id=${quizModuleId}`);
    await expectMoodlePageLoaded(page);

    const startControl = page.getByRole('button', {
      name: /attempt|preview|continue|start|intentar|previsualizar|vista previa|continuar|comenzar|resolver/i
    }).first();

    await expect(startControl).toBeVisible();
    await startControl.click();
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    const modalStart = page.getByRole('button', {
      name: /start attempt|begin attempt|comenzar intento|iniciar intento|empezar intento/i
    }).first();

    if (await modalStart.isVisible().catch(() => false)) {
      await modalStart.click();
      await page.waitForLoadState('domcontentloaded').catch(() => {});
    }

    await expect(page.locator('body')).not.toContainText(/ninguna de las preguntas tienen una calificaci[oó]n/i);
    await expect(page.locator('body')).not.toContainText(/none of the questions have a grade/i);
    await expect(page).toHaveURL(/\/mod\/quiz\/(attempt|summary|view)\.php/);
  });
}
