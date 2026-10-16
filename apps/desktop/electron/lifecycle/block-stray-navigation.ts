/* @layer electron-main @kind logic */
import type { BrowserWindow } from 'electron';

const samePage = (target: string, current: string): boolean => {
  try {
    const next = new URL(target);
    const now = new URL(current);
    return next.origin === now.origin && next.pathname === now.pathname;
  } catch {
    return false;
  }
};

const blockStrayNavigation = (win: BrowserWindow): void => {
  win.webContents.on('will-navigate', (event, url) => {
    if (!samePage(url, win.webContents.getURL())) event.preventDefault();
  });
};

export { blockStrayNavigation };
