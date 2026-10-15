/* @layer tests @kind helper */
import { test } from '@playwright/test';
import { existsSync } from 'fs';
import { E2E_INSTANCE, STATE_SPEC_CONFIG, launchApp } from '../isolated-app';
import { MAIN_JS, SETTLE_MS } from './state-harness.constants';
import type { StateReader } from './state-harness.type';
import { buildReader } from './build-reader';
import { hasFixture } from './has-fixture';

const withState = async (name: string, body: (r: StateReader) => Promise<void>): Promise<void> => {
  test.skip(!existsSync(MAIN_JS), 'dist/electron/main.js missing. Run `pnpm --filter ./apps/desktop build` first');
  test.skip(!hasFixture(name), `save-state fixture ${name}.sav is not present (private vault)`);
  const launched = await launchApp({
    instance: E2E_INSTANCE,
    openByDefault: true,
    config: STATE_SPEC_CONFIG,
    fixtures: [name],
    args: [`--auto-state=${name}`, '--widgets=navigation'],
  });
  try {
    await launched.window.waitForTimeout(SETTLE_MS);
    await body(buildReader(launched.window));
  } finally {
    await launched.close();
  }
};

export { withState };
