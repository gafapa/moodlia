import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/site',
  timeout: 30000,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-site' }]],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium'
      }
    }
  ]
});
