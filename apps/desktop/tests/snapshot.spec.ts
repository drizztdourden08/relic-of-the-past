/* @layer tests @kind test */
import { test, expect } from '@playwright/test';
import { join } from 'path';
import { existsSync } from 'fs';
import { REPO_ROOT } from './repo-root';
import { E2E_INSTANCE, MAIN_JS, assertLaunchedViaCli, launchApp } from './e2e/isolated-app';

const PROJECT_ROOT = REPO_ROOT;

const SLOT = process.env.SNAPSHOT_SLOT ?? '2';
const NAME = process.env.SNAPSHOT_NAME ?? 'snapshot';
const WAIT = parseInt(process.env.SNAPSHOT_WAIT ?? '20000', 10);

test('visual snapshot', async () => {
  test.setTimeout(60000);
  assertLaunchedViaCli();
  test.skip(!existsSync(MAIN_JS), 'Build the app first: npx electron-vite build');

  const { window, close } = await launchApp({
    instance: E2E_INSTANCE,
    args: [`--auto-state=${SLOT}`, `--screenshot=${NAME}`],
  });
  await window.waitForTimeout(WAIT);

  const screenshotPath = join(PROJECT_ROOT, 'tests', 'screenshots', `${NAME}.png`);
  expect(existsSync(screenshotPath)).toBe(true);
  test.info().annotations.push({ type: 'snapshot', description: `verified: ${screenshotPath}` });

  await close();
});
