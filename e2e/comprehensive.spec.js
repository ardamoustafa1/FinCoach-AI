import { test, expect } from '@playwright/test';

test.describe('Comprehensive Test Suite - 100/100 Release', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const demoButton = page.getByRole('button', { name: /Demo hesabı ile giriş yap|Demo/i }).first();
    if (await demoButton.isVisible({ timeout: 5000 })) {
      await demoButton.click();
      // Wait for auth context to settle
      await page.waitForTimeout(1500);
    }
  });

  test('Route Smoke Test', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Bakiye', { exact: false }).first()).toBeVisible();
    
    await page.goto('/transactions');
    await expect(page.getByText('İşlemler', { exact: false }).first()).toBeVisible();
    
    await page.goto('/goals');
    await expect(page.getByText('Hedefler', { exact: false }).first()).toBeVisible();
    
    await page.goto('/settings');
    await expect(page.getByText('Ayarlar', { exact: false }).first()).toBeVisible();
  });

  test('Transaction CRUD (Presence)', async ({ page }) => {
    await page.goto('/transactions');
    // We expect an add transaction button to exist
    const addButton = page.getByRole('button', { name: /Ekle|Yeni/i }).first();
    await expect(addButton).toBeVisible();
  });

  test('CSV Import (Presence)', async ({ page }) => {
    await page.goto('/transactions');
    // Expect CSV import button or text
    const csvButton = page.getByRole('button', { name: /CSV|Yükle/i }).first();
    await expect(csvButton).toBeVisible();
  });

  test('PDF Export (Presence)', async ({ page }) => {
    await page.goto('/reports');
    // Expect PDF export button
    const pdfButton = page.getByRole('button', { name: /PDF/i }).first();
    await expect(pdfButton).toBeVisible();
  });

  test('Chat Fallback (Presence)', async ({ page }) => {
    await page.goto('/chat');
    // Chat input or textarea must be visible
    const input = page.locator('input, textarea').first();
    await expect(input).toBeVisible();
  });

  test('Offline Sync / Network Switch (Smoke)', async ({ page }) => {
    await page.goto('/dashboard');
    // Trigger offline event
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));
    await page.waitForTimeout(500);
    // App should remain usable
    await expect(page.getByText('Bakiye', { exact: false }).first()).toBeVisible();
    
    // Trigger online event
    await page.evaluate(() => window.dispatchEvent(new Event('online')));
    await page.waitForTimeout(500);
    await expect(page.getByText('Bakiye', { exact: false }).first()).toBeVisible();
  });

  test('Restored business controls change state and export data', async ({ page }) => {
    test.setTimeout(30_000);

    await page.goto('/league');
    const leagueTour = page.getByRole('button', { name: /Keşfetmeye Başla/i });
    if (await leagueTour.isVisible()) await leagueTour.click();
    const muteButton = page.getByRole('button', { name: /Ahmet'i Sustur/i });
    await expect(muteButton).toBeVisible({ timeout: 10_000 });
    await muteButton.click();
    await expect(page.getByRole('button', { name: 'Ahmet Susturuldu' })).toBeDisabled();

    await page.goto('/synthetic-data');
    const syntheticTour = page.getByRole('button', { name: /Keşfetmeye Başla/i });
    if (await syntheticTour.isVisible()) await syntheticTour.click();
    const generateButton = page.getByRole('button', { name: 'Sentetik Veri Üretimini Başlat' });
    await expect(generateButton).toBeVisible({ timeout: 10_000 });
    await generateButton.click();

    const exportButton = page.getByRole('button', { name: 'JSON Önizlemesini İndir' });
    await expect(exportButton).toBeVisible({ timeout: 15_000 });
    const downloadPromise = page.waitForEvent('download');
    await exportButton.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^fincoach-synthetic-preview-\d{4}-\d{2}-\d{2}\.json$/);
  });
});
