/* @layer tests @kind helper */
import { test } from '@playwright/test';
import { _electron as electron } from 'playwright';
import { existsSync } from 'fs';
import type { ElectronApplication } from 'playwright';
import { appWindow } from '../app-window';
import { TEST_INSTANCE, ensureTestProfile } from '../ensure-test-profile';
import { MAIN_JS, SETTLE_MS } from './state-harness.constants';
import type { StateReader } from './state-harness.type';
import { buildReader } from './build-reader';
import { hasFixture } from './has-fixture';

const ignoreAlreadyClosed = (): void => undefined;

const withState = async (name: string, body: (r: StateReader) => Promise<void>): Promise<void> => {
  test.skip(!existsSync(MAIN_JS), 'dist/electron/main.js missing. Run `npx electron-vite build` first');
  test.skip(!hasFixture(name), `save-state fixture ${name}.sav is not present (private vault)`);
  await ensureTestProfile();
  const app: ElectronApplication = await electron.launch({
    args: [MAIN_JS, '--muted', '--no-focus', `--instance=${TEST_INSTANCE}`, `--auto-state=${name}`, '--widgets=navigation'],
    env: { ...process.env, NODE_ENV: 'production' },
  });
  try {
    const window = await appWindow(app);
    await window.waitForTimeout(SETTLE_MS);
    await body(buildReader(window));
  } finally {
    await app.close().catch(ignoreAlreadyClosed);
  }
};

export { withState };
