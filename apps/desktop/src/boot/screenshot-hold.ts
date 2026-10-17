/* @layer renderer-app @kind logic */
import { holdScreenshot, lazyLoads } from '@drizztdourden08/brock-react';
import { LAZY_IDLE_MS, PAINT_SETTLE_MS } from './screenshot-hold.constants';

const held: { release: (() => void) | null } = { release: null };

const take = (): void => {
  held.release ??= holdScreenshot();
};

const releaseHeld = (): void => {
  held.release?.();
  held.release = null;
};

const release = (): void => {
  void lazyLoads.idle(LAZY_IDLE_MS).then(() => {
    setTimeout(releaseHeld, PAINT_SETTLE_MS);
  });
};

const screenshotHold = { take, release };

export { screenshotHold };
