/* @layer tests @kind test */
import { test, expect } from '@playwright/test';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import type { Page } from 'playwright';
import { MAIN_JS, launchApp } from './isolated-app';
import { MODERN_PROFILE, PLAIN_PROFILE } from './hud-style/hud-style-profiles';
import { STYLE_ROW, STYLE_SEGMENTS, assignedSlots, labelsWhere, styleSegments } from './hud-style/hud-style-readers';
import type { ProfileSeed } from './isolated-app';
import { REPO_ROOT } from '../repo-root';

const SHOTS = join(REPO_ROOT, 'tests', 'screenshots', 'hud-style');

const MAP_ROW = '[data-setting-key="mapOnSelect"]';
const TOGGLE_TRAVEL_MS = 400;

interface Hub {
  close: () => Promise<void>;
  page: Page;
  tab: (name: string) => Promise<void>;
  shoot: (name: string, selector: string) => Promise<void>;
}

const openProfile = async (seed: ProfileSeed): Promise<Hub> => {
  mkdirSync(SHOTS, { recursive: true });
  const { app, window: page, close } = await launchApp(seed);
  await page.waitForSelector('.window-title-bar', { timeout: 60_000 });
  const cdp = await app.context().newCDPSession(page);
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1500, height: 1200, deviceScaleFactor: 1, mobile: false });
  await page.waitForTimeout(1200);
  await page.click('[aria-label="Menu"]');
  await page.getByRole('menuitem', { name: 'Settings', exact: true }).click();
  await page.waitForTimeout(2500);

  const tab = async (name: string): Promise<void> => {
    await page.locator(`.side-nav__item[aria-label="${name}"]`).first().click();
    await page.waitForTimeout(900);
  };
  const shoot = async (name: string, selector: string): Promise<void> => {
    await page.locator(selector).first().screenshot({ path: join(SHOTS, `${name}.png`) });
  };
  return { close, page, tab, shoot };
};

const shootSlots = async (page: Page, name: string): Promise<void> => {
  await page.locator('.slot-row').last().scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const boxes = await page.locator('.slot-row').evaluateAll((rows) => rows
    .map((r) => r.getBoundingClientRect())
    .filter((b) => b.top >= 0 && b.bottom <= window.innerHeight)
    .map((b): [number, number, number, number] => [b.left, b.top, b.right, b.bottom]));
  const left = Math.min(...boxes.map((b) => b[0]));
  const top = Math.min(...boxes.map((b) => b[1]));
  await page.screenshot({
    path: join(SHOTS, `${name}.png`),
    clip: {
      x: left - 8,
      y: top - 8,
      width: Math.max(...boxes.map((b) => b[2])) - left + 16,
      height: Math.max(...boxes.map((b) => b[3])) - top + 16,
    },
  });
};

const checkOriginalStyle = async ({ page, tab, shoot }: Hub): Promise<void> => {
  await tab('HUD');
  await page.locator(STYLE_SEGMENTS, { hasText: 'Original' }).click();
  await page.waitForTimeout(800);
  expect(await styleSegments(page)).toEqual([
    { label: 'Original', disabled: false, checked: true },
    { label: 'Enhanced', disabled: false, checked: false },
    { label: 'Modern', disabled: false, checked: false },
  ]);
  await expect(page.locator('.hud-style-control__notice')).toHaveCount(0);
  await shoot('01-style-three-options', STYLE_ROW);
};

const checkMapToggle = async ({ page, tab, shoot }: Hub): Promise<void> => {
  await tab('Gameplay');
  const mapToggle = page.locator(`${MAP_ROW} input`);
  await expect(mapToggle).not.toBeChecked();
  await expect(mapToggle).toBeEnabled();
  await page.locator(`${MAP_ROW} label`).click();
  await expect(mapToggle).toBeChecked();
  await page.waitForTimeout(TOGGLE_TRAVEL_MS);
  await shoot('05-map-on-select', MAP_ROW);
  await tab('Display');
  await tab('Gameplay');
  await expect(page.locator(`${MAP_ROW} input`)).toBeChecked();
  await page.locator(`${MAP_ROW} label`).click();
  await expect(page.locator(`${MAP_ROW} input`)).not.toBeChecked();
};

const checkControlsBanner = async ({ page, tab, shoot }: Hub): Promise<void> => {
  await tab('Controls');
  await expect(page.locator('.scheme-banner')).toHaveCount(1);
  await expect(page.locator('.scheme-banner')).toContainText('Modern controls are part of the Modern HUD style.');
  await expect(page.locator('.scheme-control')).toHaveCount(0);
  await expect(page.locator('[role="radiogroup"][aria-label="Control Scheme"]')).toHaveCount(0);
  const modernTab = page.getByRole('tab', { name: 'Modern Controls' });
  await expect(modernTab).toHaveAttribute('aria-disabled', 'true');
  await expect(modernTab).toHaveAttribute('aria-description', /Modern HUD style/);
  await shoot('02-controls-banner', '.controls-settings__main');

  await page.locator('.scheme-banner button').click();
  await page.waitForTimeout(1200);
  await expect(page.locator(STYLE_ROW)).toBeVisible();
  await expect(page.locator(STYLE_ROW)).toBeInViewport();
  await shoot('03-deep-link-to-style', STYLE_ROW);
};

const checkEnhancedStyle = async ({ page, shoot }: Hub): Promise<void> => {
  await page.locator(STYLE_SEGMENTS, { hasText: 'Enhanced' }).click();
  await page.waitForTimeout(1000);
  expect(await styleSegments(page)).toEqual([
    { label: 'Original', disabled: false, checked: false },
    { label: 'Enhanced', disabled: false, checked: true },
    { label: 'Modern', disabled: false, checked: false },
  ]);
  await expect(page.locator('.hud-style-control__notice')).toHaveCount(0);
  expect(await labelsWhere(page, '[data-setting-key="hudMode"] .segmented__btn:not(.fit-probe *)', 'aria-checked')).toEqual(['Enhanced']);
  expect(await labelsWhere(page, '[data-setting-key="hudEnhancedParts"] button:not(.fit-probe *)', 'aria-pressed')).toEqual(['Main', 'Pause']);
  await shoot('08-enhanced-picked', '.settings-section__group');
};

const checkModernStyle = async ({ page, tab, shoot }: Hub): Promise<void> => {
  await page.locator(STYLE_SEGMENTS, { hasText: 'Modern' }).click();
  await page.waitForTimeout(1200);
  await tab('Controls');
  await expect(page.locator('.scheme-banner')).toHaveCount(0);
  await expect(page.getByRole('tab', { name: 'Modern Controls' }))
    .toHaveAttribute('aria-selected', 'true');
  expect((await page.locator('.slot-row').count())).toBeGreaterThan(0);
  await shoot('04-controls-modern', '.controls-settings__main');
  await shootSlots(page, '04b-controls-modern-slots');

  await tab('HUD');
  await page.locator(STYLE_SEGMENTS, { hasText: 'Original' }).click();
  await page.waitForTimeout(800);
};

test.describe('HUD style drives the control scheme', () => {
  test.skip(!existsSync(MAIN_JS), 'run `npx electron-vite build` first');

  test('Original profile: three live styles, a banner instead of a scheme control', async () => {
    const hub = await openProfile(PLAIN_PROFILE);
    const { close } = hub;
    try {
      await checkOriginalStyle(hub);
      await checkMapToggle(hub);
      await checkControlsBanner(hub);
      await checkEnhancedStyle(hub);
      await checkModernStyle(hub);
    } finally {
      await close();
    }
  });

  test('a Modern profile opens on the Modern style with its slots intact', async () => {
    const { close, page, tab, shoot } = await openProfile(MODERN_PROFILE);
    try {
      await tab('HUD');
      expect(await styleSegments(page)).toEqual([
        { label: 'Original', disabled: false, checked: false },
        { label: 'Enhanced', disabled: false, checked: false },
        { label: 'Modern', disabled: false, checked: true },
      ]);
      await shoot('06-style-modern', STYLE_ROW);

      await tab('Controls');
      await expect(page.locator('.scheme-banner')).toHaveCount(0);
      await expect(page.getByRole('tab', { name: 'Modern Controls' }))
        .toHaveAttribute('aria-selected', 'true');
      expect(await assignedSlots(page)).toEqual([
        'Sword on S', 'Action on D', 'Item on W', 'Item on E',
      ]);
      await shootSlots(page, '07-modern-slots');
    } finally {
      await close();
    }
  });
});
