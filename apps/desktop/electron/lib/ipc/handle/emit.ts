/* @layer electron-main @kind logic */
import type { BrowserWindow } from 'electron';
import type { EventContract } from '@shared/ipc';

const emit = <K extends keyof EventContract>(
  win: BrowserWindow,
  channel: K,
  ...args: Parameters<EventContract[K]>
): void => {
  if (win.isDestroyed()) return;
  const wc = win.webContents;
  if (!wc || wc.isDestroyed()) return;
  try {
    wc.send(channel, ...args);
  } catch {
    return;
  }
};

export { emit };
