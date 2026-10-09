/* @layer tests @kind test */
import { test, expect, _electron as electron } from '@playwright/test';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import type { ElectronApplication, Page } from 'playwright';

const PROJECT_ROOT = join(__dirname, '..', '..');
const MAIN_JS = join(PROJECT_ROOT, 'dist', 'electron', 'main.js');
const USER_DATA = 'C:\\Users\\drizz\\AppData\\Local\\Temp\\rotp-pr';
const SHOTS = join(PROJECT_ROOT, 'tests', 'screenshots', 'hud-style');

const STYLE_ROW = '[data-setting-key="hudStyle"]';
const STYLE_SEGMENTS = `${STYLE_ROW} .segmented__btn`;
const MAP_ROW = '[data-setting-key="mapOnSelect"]';
const TOGGLE_TRAVEL_MS = 400;

interface Hub {
  app: ElectronApplication;
  page: Page;
  tab: (name: string) => Promise<void>;
  shoot: (name: string, selector: string) => Promise<void>;
}

const ignoreAlreadyClosed = (): void => undefined;

const openProfile = async (instance: string, profile: string): Promise<Hub> => {
  mkdirSync(SHOTS, { recursive: true });
  const app = await electron.launch({
    args: [MAIN_JS, '--muted', '--no-focus', `--instance=${instance}`, `--user-data=${USER_DATA.replace(/\\/g, '/')}`],
    env: { ...process.env, NODE_ENV: 'production' },
  });
  const page = await app.firstWindow();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('.titlebar', { timeout: 60_000 });
  const cdp = await app.context().newCDPSession(page);
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1500, height: 1200, deviceScaleFactor: 1, mobile: false });
  await page.waitForTimeout(1200);
  await page.locator('.list-item-row__primary', { hasText: profile }).first().click();
  await page.waitForTimeout(500);
  await page.getByText('Open Profile', { exact: true }).first().click();
  await page.waitForTimeout(2500);

  const tab = async (name: string): Promise<void> => {
    await page.locator(`.side-nav__item[aria-label="${name}"]`).first().click();
    await page.waitForTimeout(900);
  };
  const shoot = async (name: string, selector: string): Promise<void> => {
    await page.locator(selector).first().screenshot({ path: join(SHOTS, `${name}.png`) });
  };
  return { app, page, tab, shoot };
};

const shootSlots = async (page: Page, name: string): Promise<void> => {
  await page.locator('.slot-row').last().scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const boxes = await page.locator('.slot-row').evaluateAll((rows) => rows
    .map((r) => r.getBoundingClientRect())
    .filter((b) => b.top >= 0 && b.bottom <= window.innerHeight)
    .map((b) => [b.left, b.top, b.right, b.bottom]));
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

const styleSegments = (page: Page) => page.$$eval(STYLE_SEGMENTS, (els) => els.map((el) => ({
  label: (el.textContent ?? '').trim(),
  disabled: (el as HTMLButtonElement).disabled,
  checked: el.getAttribute('aria-checked') === 'true',
})));

const assignedSlots = (page: Page) => page.$$eval('.slot-row', (rows) => rows
  .map((row) => ({
    what: (row.querySelector('.binding-row__snes-label')?.textContent ?? '').trim(),
    on: (row.querySelector('.binding-row__binding-label')?.textContent ?? '').trim(),
  }))
  .filter((slot) => slot.what !== 'Unassigned')
  .map((slot) => `${slot.what} on ${slot.on}`));

test.describe('HUD style drives the control scheme', () => {
  test.skip(!existsSync(MAIN_JS), 'run `npx electron-vite build` first');

  test('Original profile: three live styles, a banner instead of a scheme control', async () => {
    const { app, page, tab, shoot } = await openProfile('hud-style-spec', 'visual-test');
    try {
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

      await tab('Controls');
      await expect(page.locator('.scheme-banner')).toHaveCount(1);
      await expect(page.locator('.scheme-banner')).toContainText('Modern controls are part of the Modern HUD style.');
      await expect(page.locator('.scheme-control')).toHaveCount(0);
      await expect(page.locator('[role="radiogroup"][aria-label="Control Scheme"]')).toHaveCount(0);
      const modernTab = page.locator('.controls-tabs__tab', { hasText: 'Modern Controls' });
      await expect(modernTab).toBeDisabled();
      await expect(page.locator('.controls-tabs__reason')).toContainText('Modern HUD style');
      await shoot('02-controls-banner', '.controls-settings__main');

      await page.locator('.scheme-banner button').click();
      await page.waitForTimeout(1200);
      await expect(page.locator(STYLE_ROW)).toBeVisible();
      await expect(page.locator(STYLE_ROW)).toBeInViewport();
      await shoot('03-deep-link-to-style', STYLE_ROW);

      await page.locator(STYLE_SEGMENTS, { hasText: 'Enhanced' }).click();
      await page.waitForTimeout(1000);
      expect(await styleSegments(page)).toEqual([
        { label: 'Original', disabled: false, checked: false },
        { label: 'Enhanced', disabled: false, checked: true },
        { label: 'Modern', disabled: false, checked: false },
      ]);
      await expect(page.locator('.hud-style-control__notice')).toHaveCount(0);
      expect(await page.$$eval('[data-setting-key="hudMode"] .segmented__btn',
        (els) => els.filter((el) => el.getAttribute('aria-checked') === 'true').map((el) => (el.textContent ?? '').trim()),
      )).toEqual(['Enhanced']);
      expect(await page.$$eval('[data-setting-key="hudEnhancedParts"] button',
        (els) => els.filter((el) => el.getAttribute('aria-pressed') === 'true').map((el) => (el.textContent ?? '').trim()),
      )).toEqual(['Main', 'Pause']);
      await shoot('08-enhanced-picked', '.settings-layout__subsection');

      await page.locator(STYLE_SEGMENTS, { hasText: 'Modern' }).click();
      await page.waitForTimeout(1200);
      await tab('Controls');
      await expect(page.locator('.scheme-banner')).toHaveCount(0);
      await expect(page.locator('.controls-tabs__tab', { hasText: 'Modern Controls' }))
        .toHaveAttribute('aria-selected', 'true');
      expect((await page.locator('.slot-row').count())).toBeGreaterThan(0);
      await shoot('04-controls-modern', '.controls-settings__main');
      await shootSlots(page, '04b-controls-modern-slots');

      await tab('HUD');
      await page.locator(STYLE_SEGMENTS, { hasText: 'Original' }).click();
      await page.waitForTimeout(800);
    } finally {
      await app.close().catch(ignoreAlreadyClosed);
    }
  });

  test('a stored modern profile migrates to the Modern style with its slots intact', async () => {
    const { app, page, tab, shoot } = await openProfile('hud-style-spec-mc', 'agent/modern-controls');
    try {
      await tab('HUD');
      expect(await styleSegments(page)).toEqual([
        { label: 'Original', disabled: false, checked: false },
        { label: 'Enhanced', disabled: false, checked: false },
        { label: 'Modern', disabled: false, checked: true },
      ]);
      await shoot('06-migrated-style-modern', STYLE_ROW);

      await tab('Controls');
      await expect(page.locator('.scheme-banner')).toHaveCount(0);
      await expect(page.locator('.controls-tabs__tab', { hasText: 'Modern Controls' }))
        .toHaveAttribute('aria-selected', 'true');
      expect(await assignedSlots(page)).toEqual([
        'Sword on S', 'Action on D', 'Item on W', 'Item on E',
      ]);
      await shootSlots(page, '07-migrated-slots');
    } finally {
      await app.close().catch(ignoreAlreadyClosed);
    }
  });
});
