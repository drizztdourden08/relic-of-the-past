/* @layer tests @kind test */
/**
 * THE HUD STYLE IS THE ONE CHOICE (contract §59), proven in the built app.
 *
 * Three facts live here, and none of them can be seen from a unit test:
 *
 *  1. **Three styles, all reachable.** Modern used to be locked whenever sprites
 *     existed, left over from when it was a sprite-free stub. So the segment
 *     the maintainer wanted was the one segment that could never be pressed.
 *  2. **The Controls screen has no scheme switch.** It carries a banner that
 *     says where the switch actually is and takes you there. A second control
 *     for one fact is exactly what this replaced.
 *  3. **A stored profile migrates, twice over.** The style's stored value was
 *     `'extended'` before §59.7 renamed it to `'enhanced'`, and a profile that
 *     also carried `controlScheme: 'modern'` is the Modern style now. Both runs
 *     off the one stored word, and the slot assignments have to survive it.
 *     Losing them would look like the profile forgetting its bindings.
 *
 * IT NEVER TOUCHES THE MAINTAINER'S SESSION (rule zero-B): its own `--instance`,
 * its own COPY of `.user-data` at a short path, `--no-focus --muted`, and every
 * setting it changes is changed back before it closes.
 */
import { test, expect, _electron as electron } from '@playwright/test';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import type { ElectronApplication, Page } from 'playwright';

const PROJECT_ROOT = join(__dirname, '..', '..');
const MAIN_JS = join(PROJECT_ROOT, 'dist', 'electron', 'main.js');
/** A COPY, at a short path, because a long one breaks `app-sprite://`. */
const USER_DATA = 'C:\\Users\\drizz\\AppData\\Local\\Temp\\rotp-pr';
const SHOTS = join(PROJECT_ROOT, 'tests', 'screenshots', 'hud-style');

const STYLE_ROW = '[data-setting-key="hudStyle"]';
const STYLE_SEGMENTS = `${STYLE_ROW} .segmented__btn`;
const MAP_ROW = '[data-setting-key="mapOnSelect"]';

interface Hub {
  app: ElectronApplication;
  page: Page;
  tab: (name: string) => Promise<void>;
  shoot: (name: string, selector: string) => Promise<void>;
}

/** Data Manager → Profiles → the row → Open Profile → the hub's side tabs. */
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
  await page.locator('.list-item-row__name', { hasText: profile }).first().click();
  await page.waitForTimeout(500);
  await page.getByText('Open Profile', { exact: true }).first().click();
  await page.waitForTimeout(2500);

  // The hub's nav (SectionNav) shows labels only while it is open, so a tab is picked by the
  // entry's accessible name, never by its label text.
  const tab = async (name: string): Promise<void> => {
    await page.locator(`.section-nav__item[aria-label="${name}"]`).first().click();
    await page.waitForTimeout(900);
  };
  const shoot = async (name: string, selector: string): Promise<void> => {
    await page.locator(selector).first().screenshot({ path: join(SHOTS, `${name}.png`) });
  };
  return { app, page, tab, shoot };
};

/**
 * The slot LIST, cropped to itself. It sits below the core verbs INSIDE the
 * column's own scroller, so an element shot of the column cuts it off and a
 * shot taken at rest shows only the first row. Scrolling the LAST row into
 * view puts the assigned end of the list on screen, which is the end this
 * spec is about; the clip is then the union of whatever rows are visible.
 */
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

/** Label + enabled/checked for each Style segment, in order. */
const styleSegments = (page: Page) => page.$$eval(STYLE_SEGMENTS, (els) => els.map((el) => ({
  label: (el.textContent ?? '').trim(),
  disabled: (el as HTMLButtonElement).disabled,
  checked: el.getAttribute('aria-checked') === 'true',
})));

/** Every slot row that actually fires something, as "<verb> on <control>". */
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
      // (1) THE STYLE ROW has three options, every one of them pressable, and NO
      //     notice under them. A greyed segment with a sentence explaining it is
      //     what this screen looked like before; silence is the pass condition.
      //     Original is PRESSED, not assumed, so the spec seeds its own
      //     precondition and a re-run never depends on how the last one ended.
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

      // (5) OPEN MAP WITH SELECT is an ordinary Gameplay toggle now, and it has
      //     to survive being written, because it moved settings file AND screen.
      await tab('Gameplay');
      const mapToggle = page.locator(`${MAP_ROW} input`);
      await expect(mapToggle).not.toBeChecked();
      await expect(mapToggle).toBeEnabled();
      await page.locator(`${MAP_ROW} label`).click();
      await expect(mapToggle).toBeChecked();
      await page.waitForTimeout(400);                          // let the thumb finish travelling
      await shoot('05-map-on-select', MAP_ROW);
      await tab('Display');
      await tab('Gameplay');
      await expect(page.locator(`${MAP_ROW} input`)).toBeChecked();
      await page.locator(`${MAP_ROW} label`).click();          // leave it as we found it
      await expect(page.locator(`${MAP_ROW} input`)).not.toBeChecked();

      // (2) THE CONTROLS SCREEN shows the banner, no scheme control anywhere, and
      //     the Modern Controls tab greyed with a reason that no longer points
      //     at a control that does not exist.
      await tab('Controls');
      await expect(page.locator('.scheme-banner')).toHaveCount(1);
      await expect(page.locator('.scheme-banner')).toContainText('Modern controls are part of the Modern HUD style.');
      await expect(page.locator('.scheme-control')).toHaveCount(0);
      await expect(page.locator('[role="radiogroup"][aria-label="Control Scheme"]')).toHaveCount(0);
      const modernTab = page.locator('.controls-tabs__tab', { hasText: 'Modern Controls' });
      await expect(modernTab).toBeDisabled();
      await expect(page.locator('.controls-tabs__reason')).toContainText('Modern HUD style');
      await shoot('02-controls-banner', '.controls-settings__main');

      // (3) THE BANNER'S BUTTON is the whole point of it: one click and the
      //     Style row is on screen, on the HUD tab.
      await page.locator('.scheme-banner button').click();
      await page.waitForTimeout(1200);
      await expect(page.locator(STYLE_ROW)).toBeVisible();
      await expect(page.locator(STYLE_ROW)).toBeInViewport();
      await shoot('03-deep-link-to-style', STYLE_ROW);

      // (3b) PRESS ENHANCED, whose stored value the §59.7 rename moved.
      //      Selecting it has to turn HUD Mode to Enhanced and light BOTH parts,
      //      which is `hostDrawnHud` answering on the NEW value: if the rename had
      //      missed a site, the segment would light and nothing beneath it would.
      //      That pair is the whole of the in-game HUD path, read from the screen.
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

      // (4) PRESS MODERN and the Controls screen answers: the banner is gone,
      //     the Modern Controls tab is the live one, and it lists slots.
      await page.locator(STYLE_SEGMENTS, { hasText: 'Modern' }).click();
      await page.waitForTimeout(1200);
      await tab('Controls');
      await expect(page.locator('.scheme-banner')).toHaveCount(0);
      await expect(page.locator('.controls-tabs__tab', { hasText: 'Modern Controls' }))
        .toHaveAttribute('aria-selected', 'true');
      expect((await page.locator('.slot-row').count())).toBeGreaterThan(0);
      await shoot('04-controls-modern', '.controls-settings__main');
      await shootSlots(page, '04b-controls-modern-slots');

      await tab('HUD');                                        // leave it as we found it
      await page.locator(STYLE_SEGMENTS, { hasText: 'Original' }).click();
      await page.waitForTimeout(800);
    } finally {
      await app.close().catch(() => { /* already gone */ });
    }
  });

  test('a stored modern profile migrates to the Modern style with its slots intact', async () => {
    // Stored as `hudStyle: 'extended'` (the pre-§59.7 spelling) + `controlScheme:
    // 'modern'`, with four assignments keyed by the pre-§19 `slot:kb:*` ids. All
    // three migrations have to land for this to read right: the value rename, the
    // style collapse that beats it to the answer, and the slot renumbering.
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
      await app.close().catch(() => { /* already gone */ });
    }
  });
});
