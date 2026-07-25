/* @layer tests @kind test */
/**
 * Shared launch harness for the per-save-state specs in this folder.
 *
 * Every one of them does the same three things: boot the BUILT app on a named
 * manual save with the navigation widget open, read facts out of the rendered
 * panel, shut down. Only the assertions differ, so the launching, the settle and
 * the teardown live here once.
 *
 * The `.sav` fixtures are ROM-derived and gitignored, so a clone without the
 * private vault has none of them. A missing fixture therefore SKIPS the spec
 * rather than failing it — a public checkout must stay green.
 */
import { test } from '@playwright/test';
import { _electron as electron } from 'playwright';
import { join } from 'path';
import { existsSync } from 'fs';
import { execSync } from 'child_process';
import type { ElectronApplication, Page } from 'playwright';
import {
  readStates, awaitState, readFlood, readGroups, readRows, readTags, readCheckSummary, readScreenId,
} from './state-readers';
import type { AnnotationRow, CheckSummary } from './state-readers';

const PROJECT_ROOT = join(__dirname, '..', '..');
const MAIN_JS = join(PROJECT_ROOT, 'dist', 'electron', 'main.js');
const FIXTURES = join(PROJECT_ROOT, 'tests', 'fixtures', 'save-states');

/** How long the core needs before the widget reports live memory. */
const SETTLE_MS = 16_000;

/** Keyboard codes per SNES button — shared/input/data/presets/keyboard.ts. */
const KEYS: Readonly<Record<string, string>> = {
  Up: 'ArrowUp', Down: 'ArrowDown', Left: 'ArrowLeft', Right: 'ArrowRight',
  A: 'KeyD', B: 'KeyS', X: 'KeyA', Y: 'KeyW', L: 'KeyQ', R: 'KeyE',
  Start: 'Enter', Select: 'ShiftRight',
};

interface StateReader {
  window: Page;
  /** Bind the standard keyboard keys in the live input manager — see below. */
  enableKeyboard: () => Promise<void>;
  states: () => Promise<string[]>;
  awaitState: (match: RegExp, timeoutMs?: number) => Promise<string>;
  flood: () => Promise<{ reachable: number; total: number }>;
  groups: () => Promise<Record<string, number>>;
  rows: () => Promise<AnnotationRow[]>;
  tags: () => Promise<string[]>;
  checkSummary: () => Promise<CheckSummary>;
  screenId: () => Promise<string>;
  /** Tap a SNES button. `holdMs` must outlast one input poll to register. */
  press: (button: string, holdMs?: number) => Promise<void>;
}

/** A save state is only usable if its fixture came down with the vault. */
const hasFixture = (name: string): boolean => existsSync(join(FIXTURES, `${name}.sav`));

const killElectron = () => {
  try { execSync('taskkill /F /IM electron.exe /T', { stdio: 'ignore' }); } catch { /* none running */ }
};

/**
 * Make `press()` work whatever controller the machine happens to have.
 *
 * Input is gated on the ACTIVE PROFILE's device map by design: only a keyboard
 * whose keys the profile binds may drive the game (profile-devices.ts). On a
 * machine whose active profile is a gamepad, `allowed.keyboard` is false and the
 * key map is empty, so synthesized keystrokes reach the renderer and stop there.
 *
 * A permanent test must not depend on which pad the user last used, so this binds
 * the default keyboard layout into the live manager. It is an in-memory change in
 * the page under test — the user's stored profile is never touched — and it opens
 * exactly the one gate, leaving the rest of the input path real.
 */
const enableKeyboard = async (window: Page): Promise<void> => {
  const pairs = Object.entries(KEYS).map(([button, code]) => [code, button]);
  const bound = await window.evaluate((ps: [string, string][]) => {
    const im = (window as unknown as { __inputManager?: {
      keyboardMap: Map<string, string>;
      allowed: { keyboard: boolean };
    } }).__inputManager;
    if (!im) return 0;
    for (const [code, button] of ps) im.keyboardMap.set(code, button);
    im.allowed = { ...im.allowed, keyboard: true };
    return im.keyboardMap.size;
  }, pairs as [string, string][]);
  if (bound === 0) throw new Error('no __inputManager on the page — cannot drive input');
};

const buildReader = (window: Page): StateReader => ({
  window,
  enableKeyboard: () => enableKeyboard(window),
  states: () => readStates(window),
  awaitState: (match, timeoutMs) => awaitState(window, match, timeoutMs),
  flood: () => readFlood(window),
  groups: () => readGroups(window),
  rows: () => readRows(window),
  tags: () => readTags(window),
  checkSummary: () => readCheckSummary(window),
  screenId: () => readScreenId(window),
  press: async (button, holdMs = 200) => {
    const key = KEYS[button] ?? button;
    await window.keyboard.down(key);
    await window.waitForTimeout(holdMs);
    await window.keyboard.up(key);
    await window.waitForTimeout(200);
  },
});

/**
 * Launch on `name`, hand the body a reader, always close. Skips (never fails)
 * when the build or the private fixture is absent.
 */
const withState = async (name: string, body: (r: StateReader) => Promise<void>): Promise<void> => {
  test.skip(!existsSync(MAIN_JS), 'dist/electron/main.js missing — run `npx electron-vite build` first');
  test.skip(!hasFixture(name), `save-state fixture ${name}.sav is not present (private vault)`);
  killElectron();
  const app: ElectronApplication = await electron.launch({
    args: [MAIN_JS, '--muted', '--no-focus', `--auto-state=${name}`, '--widgets=navigation'],
    env: { ...process.env, NODE_ENV: 'production' },
  });
  try {
    const window = await app.firstWindow();
    await window.waitForLoadState('domcontentloaded');
    await window.waitForTimeout(SETTLE_MS);
    await body(buildReader(window));
  } finally {
    await app.close().catch(() => { /* already gone */ });
  }
};

export { withState, hasFixture, killElectron, KEYS, SETTLE_MS, MAIN_JS, FIXTURES };
export type { StateReader };
