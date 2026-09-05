/* @layer tests @kind test */
/**
 * Visual snapshot test, driven entirely by CLI args. It launches the app through
 * the built-in auto-test API route. The app loads the current profile, loads save
 * state slot N, takes a screenshot and writes tests/screenshots/{NAME}.png.
 *
 * Usage:
 *   npx playwright test tests/snapshot.spec.ts
 *
 * Environment variables:
 *   SNAPSHOT_SLOT: save state slot to load (default 2)
 *   SNAPSHOT_NAME: output filename without extension (default 'snapshot')
 *   SNAPSHOT_WAIT: extra ms to wait for the app to finish (default 20000)
 */

import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import { join } from 'path';
import { existsSync } from 'fs';

const PROJECT_ROOT = join(__dirname, '..');
const MAIN_JS = join(PROJECT_ROOT, 'dist', 'electron', 'main.js');

const SLOT = process.env.SNAPSHOT_SLOT ?? '2';
const NAME = process.env.SNAPSHOT_NAME ?? 'snapshot';
const WAIT = parseInt(process.env.SNAPSHOT_WAIT ?? '20000', 10);

test('visual snapshot', async () => {
  test.setTimeout(60000);
  test.skip(!existsSync(MAIN_JS), 'Build the app first: npx electron-vite build');

  const app = await electron.launch({
    args: [MAIN_JS, '--muted', '--no-focus', `--auto-state=${SLOT}`, `--screenshot=${NAME}`],
    env: { ...process.env, NODE_ENV: 'production' },
  });

  const window = await app.firstWindow();
  await window.waitForLoadState('domcontentloaded');

  // The app auto-test hook handles: start game → load state → take screenshot.
  // Just wait for it to complete and verify the file was created.
  await window.waitForTimeout(WAIT);

  const screenshotPath = join(PROJECT_ROOT, 'tests', 'screenshots', `${NAME}.png`);
  expect(existsSync(screenshotPath)).toBe(true);
  console.log(`[snapshot] verified: ${screenshotPath}`);

  await app.close();
});
