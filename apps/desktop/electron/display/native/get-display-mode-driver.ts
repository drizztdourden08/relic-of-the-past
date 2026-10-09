/* @layer electron-main @kind logic */
import type { DisplayModeDriver } from './display-mode-driver.type';
import { createUnsupportedDriver } from './create-unsupported-driver';
import { BUILDERS } from './native.constants';

let driver: DisplayModeDriver | null = null;

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
