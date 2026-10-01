import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:8555',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    // DEMO_MODE: testlerin gizli anahtar olmadan çalışabilmesi için
    command: 'DEMO_MODE=true PORT=8555 npm start',
    port: 8555,
    reuseExistingServer: false,
    timeout: 90_000,
  },
});
