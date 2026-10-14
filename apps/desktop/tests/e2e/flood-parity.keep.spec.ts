/* @layer tests @kind test */
import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import { join } from 'path';
import { existsSync, readFileSync, rmSync } from 'fs';
import { appWindow } from './app-window';
import { TEST_INSTANCE, ensureTestProfile } from './ensure-test-profile';
import { REPO_ROOT } from '../repo-root';

const PROJECT_ROOT = REPO_ROOT;
const MAIN_JS = join(PROJECT_ROOT, 'apps', 'desktop', 'dist', 'electron', 'main.js');
const DUMP_PATH = join(PROJECT_ROOT, 'debug-output', 'dump-nav.json');
const STATES = ['test-jail-cell', 'test-throne-room', 'test-sanctuary-grounds'];
const ignoreAlreadyExited = (): void => undefined;

const widgetReachable = async (state: string): Promise<number> => {
  await ensureTestProfile();
  const app = await electron.launch({
    args: [MAIN_JS, '--muted', '--no-focus', `--instance=${TEST_INSTANCE}`, `--auto-state=${state}`, '--widgets=navigation'],
    env: { ...process.env, NODE_ENV: 'production' },
  });
  try {
    const window = await appWindow(app);
    await window.waitForTimeout(16_000);
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

const dumpReachable = async (state: string): Promise<number> => {
  await ensureTestProfile();
  if (existsSync(DUMP_PATH)) rmSync(DUMP_PATH);
  const app = await electron.launch({
    args: [MAIN_JS, '--muted', '--no-focus', `--instance=${TEST_INSTANCE}`, `--dump-nav=${state}`],
    env: { ...process.env, NODE_ENV: 'production' },
  });
  try {
    for (let i = 0; i < 120 && !existsSync(DUMP_PATH); i++) {
      await new Promise((r) => setTimeout(r, 1000));
    }
    if (!existsSync(DUMP_PATH)) throw new Error(`--dump-nav=${state} wrote no dump`);
    const dump = JSON.parse(readFileSync(DUMP_PATH, 'utf8')) as { error?: string; floodFill?: { reachableCount?: number } };
    if (dump.error) throw new Error(`--dump-nav=${state} reported: ${dump.error}`);
    return dump.floodFill?.reachableCount ?? -1;
  } finally {
    await app.close().catch(ignoreAlreadyExited);
  }
};

for (const state of STATES) {
  test(`flood parity: ${state}`, async () => {
    test.setTimeout(600_000);
    const widget = await widgetReachable(state);
    const dump = await dumpReachable(state);
    test.info().annotations.push({ type: 'parity', description: `${state} widget=${widget} dump=${dump}` });
    expect(widget, `widget reported ${widget} but --dump-nav reported ${dump} for ${state}`).toBe(dump);
  });
}
