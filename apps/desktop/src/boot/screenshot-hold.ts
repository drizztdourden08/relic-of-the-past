/* @layer renderer-app @kind logic */
import { holdScreenshot } from '@drizztdourden08/brock-react';

const held: { release: (() => void) | null } = { release: null };

const take = (): void => {
  held.release ??= holdScreenshot();
};

const release = (): void => {
  held.release?.();
  held.release = null;
};

const screenshotHold = { take, release };

export { screenshotHold };
