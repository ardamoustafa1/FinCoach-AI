// @ts-check
import { test, expect } from '@playwright/test';

/*
 * FinCoach AI — Frontend Smoke Tests
 * These tests validate the critical happy-path flows that a hackathon judge would follow.
 * They run against the Vite dev server (auto-started via playwright.config.js).
 */

// ─── 1. Tanıtım Sayfası ─────────────────────────────────────────────────────
// Oturum açmamış ziyaretçi `/` adresinde tanıtım sayfasını görür;
// giriş formu bir tık uzaktadır.
test('Tanıtım sayfası açılır ve giriş formuna götürür', async ({ page }) => {
  await page.goto('/');

  // Tanıtım sayfası hero'su ve ana çağrılar
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: /Giriş yap/i }).first()).toBeVisible();

  // Girişe geç → e-posta + şifre + gönder butonu
  await page.getByRole('button', { name: /Giriş yap/i }).first().click();
  await expect(page.locator('input[type="email"]').first()).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('input[type="password"]').first()).toBeVisible();
  await expect(page.getByRole('button', { name: /^Giriş yap$/i }).first()).toBeVisible();
});

// ─── 2. Açılış Ekranı ───────────────────────────────────────────────────────
test('Oturum kontrol edilirken açılış ekranı görünür', async ({ page }) => {
  await page.goto('/');
  // Ya açılış ekranı (aria-live durum metni) ya da tanıtım sayfası görünür olmalı
  const bootOrLanding = page.locator('[aria-live="polite"], h1').first();
  await expect(bootOrLanding).toBeVisible({ timeout: 10_000 });
});

// ─── 3. Page Title Updates Correctly ────────────────────────────────────────
test('Document title contains FinCoach AI', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(2000);
  const title = await page.title();
  expect(title).toContain('FinCoach AI');
});

// ─── 4. Auth Form Validation Works ──────────────────────────────────────────
test('Auth form shows validation on empty submit', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(1500);
  // Tanıtım sayfasından giriş formuna geç
  await page.getByRole('button', { name: /Giriş yap/i }).first().click();
  await page.waitForTimeout(800);

  // Try to find and click submit without filling fields
  const submitBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Kayıt")').first();
  if (await submitBtn.isVisible()) {
    await submitBtn.click();
    // The page should not navigate away — still on auth
    await page.waitForTimeout(1000);
    const stillOnAuth = page.locator('input[type="email"], input[placeholder*="mail"], input[placeholder*="E-posta"]').first();
    await expect(stillOnAuth).toBeVisible();
  }
});

// ─── 5. Demo Account Can Open All Judge-Facing Routes ──────────────────────
test('Demo account opens all primary routes without app errors', async ({ page }) => {
  test.setTimeout(45_000);

  const consoleErrors = [];
  page.on('pageerror', error => consoleErrors.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(`console: ${message.text()}`);
  });

  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();

  const demoButton = page.getByRole('button', { name: /Demo hesabı ile giriş yap|Demo Gir|Demo/i }).first();
  await expect(demoButton).toBeVisible({ timeout: 10_000 });
  await demoButton.click();
  await page.waitForTimeout(1_000);

  const routes = [
    '/',
    '/dashboard',
    '/transactions',
    '/wealth',
    '/micro-invest',
    '/debt-snowball',
    '/freelancer-smoother',
    '/tax',
    '/real-estate',
    '/anomaly',
    '/graph-analysis',
    '/system-monitor',
    '/federated',
    '/escrow',
    '/autonomous-agent',
    '/financial-icu',
    '/dead-mans-switch',
    '/voice-escrow',
    '/synthetic-data',
    '/goals',
    '/league',
    '/cashflow',
    '/stress-test',
    '/time-machine',
    '/subscriptions',
    '/shop-sim',
    '/chat',
    '/reports',
    '/settings',
  ];

  const routeFailures = [];
  for (const route of routes) {
    consoleErrors.length = 0;
    await page.goto(route);
    await page.waitForTimeout(350);
    const bodyText = await page.locator('body').innerText();
    const visibleError = /Bir şeyler ters gitti|Ekran güvenli moda alındı|Application error|ReferenceError/.test(bodyText);
    if (visibleError || consoleErrors.length > 0) {
      routeFailures.push({ route, visibleError, consoleErrors: [...consoleErrors] });
    }
  }

  expect(routeFailures).toEqual([]);
});
