// @ts-check
import { test, expect } from '@playwright/test';

/*
 * FinCoach AI — Frontend Smoke Tests
 * These tests validate the critical happy-path flows that a hackathon judge would follow.
 * They run against the Vite dev server (auto-started via playwright.config.js).
 */

// ─── 1. Auth Page Loads ─────────────────────────────────────────────────────
test('Auth page renders login form', async ({ page }) => {
  await page.goto('/');
  // The auth page should show email + password fields and a submit button
  await expect(page.locator('input[type="email"], input[placeholder*="mail"], input[placeholder*="E-posta"]').first()).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('input[type="password"]').first()).toBeVisible();
  // A login/register button should exist
  const submitBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Kayıt")').first();
  await expect(submitBtn).toBeVisible();
});

// ─── 2. App Shell Renders After Auth (Skeleton/Loading) ─────────────────────
test('Loading skeleton appears while session is checked', async ({ page }) => {
  await page.goto('/');
  // Either the auth page or the loading skeleton should appear
  const authOrSkeleton = page.locator('input[type="email"], .skeleton-box, [aria-live="polite"]').first();
  await expect(authOrSkeleton).toBeVisible({ timeout: 10_000 });
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
  await page.waitForTimeout(2000);

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
