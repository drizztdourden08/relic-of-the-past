/* @layer tests @kind test */
import { test, expect } from '@playwright/test';
import { join } from 'path';
import { existsSync, readFileSync, rmSync } from 'fs';
import { E2E_INSTANCE, STATE_SPEC_CONFIG, launchApp } from './isolated-app';
import { REPO_ROOT } from '../repo-root';

const PROJECT_ROOT = REPO_ROOT;
const DUMP_PATH = join(PROJECT_ROOT, 'debug-output', 'dump-nav.json');
const STATES = ['test-jail-cell', 'test-throne-room', 'test-sanctuary-grounds'];

const widgetReachable = async (state: string): Promise<number> => {
  const { window, close } = await launchApp({
    instance: E2E_INSTANCE,
    openByDefault: true,
    config: STATE_SPEC_CONFIG,
    fixtures: [state],
    args: [`--auto-state=${state}`, '--widgets=navigation'],
  });
  try {
    await window.waitForTimeout(16_000);
    await window.getByRole('button', { name: /Flood Fill/ }).dispatchEvent('click');
    await window.waitForTimeout(3500);
    const text = await window.locator('text=/^\\d+\\/\\d+ \\(\\d+%\\)$/').first().textContent();
    const m = /^(\d+)\//.exec(text ?? '');
    if (!m) throw new Error(`no reachable count rendered for ${state}: ${text}`);
    return Number(m[1]);
  } finally {
    await close();
  }
};

const dumpReachable = async (state: string): Promise<number> => {
  if (existsSync(DUMP_PATH)) rmSync(DUMP_PATH);
  const { close } = await launchApp({
    instance: E2E_INSTANCE,
    openByDefault: true,
    config: STATE_SPEC_CONFIG,
    fixtures: [state],
    args: [`--dump-nav=${state}`],
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
    await close();
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
