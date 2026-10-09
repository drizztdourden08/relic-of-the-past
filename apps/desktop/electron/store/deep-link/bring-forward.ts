/* @layer electron-main @kind logic */
import type { BrowserWindow } from 'electron';

const bringForward = (window: BrowserWindow): void => {
  if (window.isMinimized()) window.restore();
  window.show();
  window.focus();
};

export { bringForward };
