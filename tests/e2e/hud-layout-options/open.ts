/* @layer tests @kind helper */
import { _electron as electron } from 'playwright';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { MAIN_JS, SETTLE_MS, SHOTS, USER_DATA } from './hud-layout-options.constants';
import type { Rig } from './hud-layout-options.type';
import { readLattice } from './read-lattice';
import { readOverlay } from './read-overlay';
import { readPlaced } from './read-placed';
import { readShape } from './read-shape';

const TALL_VIEWPORT = { width: 1500, height: 1750, deviceScaleFactor: 1, mobile: false };
const ignoreAlreadyClosed = (): void => undefined;

const open = async (): Promise<Rig> => {
  mkdirSync(SHOTS, { recursive: true });
  const app = await electron.launch({
    args: [MAIN_JS, '--muted', '--no-focus', '--instance=layout-options', `--user-data=${USER_DATA}`],
    env: { ...process.env, NODE_ENV: 'production' },
  });
  const window = await app.firstWindow();
  await window.waitForLoadState('domcontentloaded');
  await window.waitForSelector('.titlebar', { timeout: 60_000 });
  const cdp = await app.context().newCDPSession(window);
  await cdp.send('Emulation.setDeviceMetricsOverride', TALL_VIEWPORT);
  await window.click('[aria-label="Menu"]');
  await window.click('text=Advanced');
  await window.click('text=HUD Layout Editor');
  await window.waitForSelector('.hud-editor', { timeout: 30_000 });
  await window.waitForTimeout(1000);

  const settle = async (): Promise<void> => { await window.waitForTimeout(SETTLE_MS); };

  return {
    app,
    window,
    shape: async (title) => {
      await settle();
      return window.evaluate(readShape, title);
    },
    placed: async () => {
      await settle();
      return window.evaluate(readPlaced);
    },
    overlay: async () => {
      await settle();
      return window.evaluate(readOverlay);
    },
    lattice: async () => {
      await settle();
      return window.evaluate(readLattice);
    },
    pick: async (id) => {
      await window.locator('.hud-outline__row', { hasText: id }).first().click();
      await window.waitForTimeout(400);
      const head = window.locator('.hud-section__head', { hasText: 'Layout' }).first();
      if ((await head.getAttribute('aria-expanded')) !== 'true') await head.click();
      await window.waitForTimeout(400);
    },
    shoot: async (name) => {
      await window.locator('.hud-editor__body').screenshot({ path: join(SHOTS, `${name}.png`) });
    },
    close: async () => { await app.close().catch(ignoreAlreadyClosed); },
  };
};

export { open };
