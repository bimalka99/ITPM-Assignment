// playwright.config.js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  timeout: 60000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],

  use: {
    headless: false,              // show browser
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    navigationTimeout: 30000,
    actionTimeout: 15000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],
});
