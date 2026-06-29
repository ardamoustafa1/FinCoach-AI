import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('Home page should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
    
    // Check the page, excluding elements that are out of our control or explicitly known to be tricky for automated tools
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
      // We aim for zero issues, but can exclude some rules if needed for third-party components
      // rules: { 'color-contrast': { enabled: false } }
    });
  });
});
