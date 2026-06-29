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
});
