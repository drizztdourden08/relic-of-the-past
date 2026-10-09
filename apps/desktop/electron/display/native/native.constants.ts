/* @layer electron-main @kind constants */
import type { DisplayModeDriver } from './display-mode-driver.type';
import { createWindowsDriver } from './windows';
import { createMacDriver } from './macos';
import { createLinuxDriver } from './linux';

const BUILDERS: Record<string, () => DisplayModeDriver> = {
  win32: createWindowsDriver,
  darwin: createMacDriver,
  linux: createLinuxDriver,
};

export { BUILDERS };
