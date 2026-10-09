/* @layer electron-main @kind logic */
import type { DisplayModeDriver } from './display-mode-driver.type';

const createUnsupportedDriver = (): DisplayModeDriver => ({
  platform: process.platform,
  available: false,
  unavailableReason: `changing the refresh rate is not implemented on ${process.platform}`,
  listRates: () => [],
  currentRate: () => null,
  setRate: () => false,
});

export { createUnsupportedDriver };
