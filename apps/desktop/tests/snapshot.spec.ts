/* @layer tests @kind test */
import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import { join } from 'path';
import { existsSync } from 'fs';
import { REPO_ROOT } from './repo-root';
import { assertLaunchedViaCli } from './e2e/isolated-app/require-cli';

const PROJECT_ROOT = REPO_ROOT;
const MAIN_JS = join(PROJECT_ROOT, 'apps', 'desktop', 'dist', 'electron', 'main.js');

const SLOT = process.env.SNAPSHOT_SLOT ?? '2';
const NAME = process.env.SNAPSHOT_NAME ?? 'snapshot';
const WAIT = parseInt(process.env.SNAPSHOT_WAIT ?? '20000', 10);

test('visual snapshot', async () => {
  test.setTimeout(60000);
  test.skip(!existsSync(MAIN_JS), 'Build the app first: npx electron-vite build');
  assertLaunchedViaCli();

  const app = await electron.launch({
    args: [MAIN_JS, '--muted', '--no-focus', `--auto-state=${SLOT}`, `--screenshot=${NAME}`],
    env: { ...process.env, NODE_ENV: 'production' },
  });

  const window = await app.firstWindow();
  await window.waitForLoadState('domcontentloaded');
  await window.waitForTimeout(WAIT);

  const screenshotPath = join(PROJECT_ROOT, 'tests', 'screenshots', `${NAME}.png`);
  expect(existsSync(screenshotPath)).toBe(true);
  test.info().annotations.push({ type: 'snapshot', description: `verified: ${screenshotPath}` });

  await app.close();
});
