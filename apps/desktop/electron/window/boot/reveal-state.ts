/* @layer electron-main @kind logic */
import type { BrowserWindow } from 'electron';

const revealState = {
  target: null as BrowserWindow | null,
  watchdog: null as NodeJS.Timeout | null,
  revealed: true,
};

export { revealState };
