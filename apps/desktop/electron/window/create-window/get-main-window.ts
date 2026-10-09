/* @layer electron-main @kind logic */
import type { BrowserWindow } from 'electron';
import { mainWindowState } from './main-window-state';

const getMainWindow = (): BrowserWindow | null => {
  return mainWindowState.window;
};

export { getMainWindow };
