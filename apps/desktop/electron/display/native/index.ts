/* @layer electron-main @kind logic */
/**
 * Picks the platform's display-mode driver once, at first use. Any platform without one gets
 * an inert driver that reports why, so callers never branch on process.platform themselves.
 */
import type { DisplayModeDriver } from './types';
import { createWindowsDriver } from './windows';
import { createMacDriver } from './macos';
import { createLinuxDriver } from './linux';

const createUnsupportedDriver = (): DisplayModeDriver => ({
  platform: process.platform,
  available: false,
  unavailableReason: `changing the refresh rate is not implemented on ${process.platform}`,
  listRates: () => [],
  currentRate: () => null,
  setRate: () => false,
});

const BUILDERS: Record<string, () => DisplayModeDriver> = {
  win32: createWindowsDriver,
  darwin: createMacDriver,
  linux: createLinuxDriver,
};

let driver: DisplayModeDriver | null = null;

/** Built lazily: constructing a driver loads native bindings, which startup should not pay for. */
const getDisplayModeDriver = (): DisplayModeDriver => {
  if (!driver) {
    const build = BUILDERS[process.platform] ?? createUnsupportedDriver;
    try {
      driver = build();
    } catch {
      driver = createUnsupportedDriver();
    }
  }
  return driver;
};

export { getDisplayModeDriver };
export type { DisplayModeDriver };
