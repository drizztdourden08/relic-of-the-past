/* @layer shared-game @kind logic */
import { buildScreenLookup } from './build-screen-lookup';
import type { ScreenLookup } from './detection.type';

let cachedLookup: ScreenLookup | null = null;

const getScreenLookup = (): ScreenLookup => {
  cachedLookup ??= buildScreenLookup();
  return cachedLookup;
};

export { getScreenLookup };
