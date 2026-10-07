/* @layer tests @kind test */
/**
 * PERMANENT (`.keep.spec.ts`). Do not delete with the scratch specs.
 *
 * One location must flood to the SAME number no matter who asks: the
 * navigation widget, the simulator's runner and the offline `--dump-nav`
 * dumper. They disagreed for a long time (Jail Cell: dumper 590, widget 608)
 * because the dumper hand-built its options with an EMPTY inventory and a
 * hard-coded interior tile context. That was found by eye in a screenshot.
 *
 * This drives the real app once per state, reads the widget's reachable count
 * and the dumper's JSON, and asserts they match.
 */
import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import { join } from 'path';
import { existsSync, readFileSync, rmSync } from 'fs';
import { TEST_INSTANCE, ensureTestProfile } from './ensure-test-profile';

const PROJECT_ROOT = join(__dirname, '..', '..');
const MAIN_JS = join(PROJECT_ROOT, 'dist', 'electron', 'main.js');
const DUMP_PATH = join(PROJECT_ROOT, 'debug-output', 'dump-nav.json');

/** Named manual saves. They are stable by design, unlike quick slots. */
const STATES = ['test-jail-cell', 'test-throne-room', 'test-sanctuary-grounds'];

/** The widget's own reachable count, read from the rendered panel. */
const widgetReachable = async (state: string): Promise<number> => {
  await ensureTestProfile();
  const app = await electron.launch({
    args: [MAIN_JS, '--muted', '--no-focus', `--instance=${TEST_INSTANCE}`, `--auto-state=${state}`, '--widgets=navigation'],
    env: { ...process.env, NODE_ENV: 'production' },
  });
  try {
    const window = await app.firstWindow();
    await window.waitForLoadState('domcontentloaded');
    await window.waitForTimeout(16_000);
    // dispatchEvent, NOT click(): Playwright's click path calls Page.bringToFront(),
    // which raises and activates the window on Windows and steals the user's focus.
    await window.getByRole('button', { name: /Flood Fill/ }).dispatchEvent('click');
    await window.waitForTimeout(3500);
    const text = await window.locator('text=/^\\d+\\/\\d+ \\(\\d+%\\)$/').first().textContent();
    const m = /^(\d+)\//.exec(text ?? '');
    if (!m) throw new Error(`no reachable count rendered for ${state}: ${text}`);
    return Number(m[1]);
  } finally {
    await app.close();
  }
};

/** The dumper's reachable count for the same state. */
const dumpReachable = async (state: string): Promise<number> => {
  await ensureTestProfile();
  if (existsSync(DUMP_PATH)) rmSync(DUMP_PATH);
  const app = await electron.launch({
    args: [MAIN_JS, '--muted', '--no-focus', `--instance=${TEST_INSTANCE}`, `--dump-nav=${state}`],
    env: { ...process.env, NODE_ENV: 'production' },
  });
  try {
    // The app writes the dump and exits itself; poll for the file.
    for (let i = 0; i < 120 && !existsSync(DUMP_PATH); i++) {
      await new Promise((r) => setTimeout(r, 1000));
    }
    if (!existsSync(DUMP_PATH)) throw new Error(`--dump-nav=${state} wrote no dump`);
    const dump = JSON.parse(readFileSync(DUMP_PATH, 'utf8'));
    if (dump.error) throw new Error(`--dump-nav=${state} reported: ${dump.error}`);
    return dump.floodFill?.reachableCount ?? -1;
  } finally {
    await app.close().catch(() => { /* already exited itself */ });
  }
};

for (const state of STATES) {
  test(`flood parity: ${state}`, async () => {
    test.setTimeout(600_000);
    const widget = await widgetReachable(state);
    const dump = await dumpReachable(state);
    console.log(`PARITY ${state} widget=${widget} dump=${dump}`);
    expect(widget, `widget reported ${widget} but --dump-nav reported ${dump} for ${state}`).toBe(dump);
  });
}
