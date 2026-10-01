import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('Tanıtım sayfasında otomatik tespit edilebilir erişilebilirlik ihlali olmamalı', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#root button', { timeout: 15_000 });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (results.violations.length) {
      console.log(
        'Erişilebilirlik ihlalleri:\n' +
        results.violations
          .map((v) => `  · [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} düğüm)\n` +
            v.nodes.slice(0, 8).map((n) => `      ${n.html?.slice(0, 130)}\n      → ${n.failureSummary?.replace(/\n/g, ' ').slice(0, 220)}`).join('\n'))
          .join('\n'),
      );
    }

    expect(results.violations).toEqual([]);
  });
});
