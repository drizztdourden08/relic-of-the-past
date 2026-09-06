/* @layer electron-main @kind logic */
/**
 * Typed main-process IPC primitives. `handle`/`on`/`emit` constrain the channel
 * to a key of the contract and infer args + return from it, so a typo'd channel
 * or wrong handler signature is a compile error.
 */
import { ipcMain } from 'electron';
import type { BrowserWindow, IpcMainInvokeEvent, IpcMainEvent } from 'electron';
import type { InvokeContract, SendContract, EventContract } from '@shared/ipc';

const handle = <K extends keyof InvokeContract>(
  channel: K,
  fn: (event: IpcMainInvokeEvent, ...args: Parameters<InvokeContract[K]>)
    => ReturnType<InvokeContract[K]> | Awaited<ReturnType<InvokeContract[K]>>,
): void => ipcMain.handle(channel, fn as never);

const on = <K extends keyof SendContract>(
  channel: K,
  fn: (event: IpcMainEvent, ...args: Parameters<SendContract[K]>) => void,
): void => {
  ipcMain.on(channel, fn as never);
};

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
    // The render frame can be mid-disposal during a reload/navigation, which makes
    // webContents.send throw ("Render frame was disposed before WebFrameMain could be
    // accessed"). These are fire-and-forget events and the renderer re-subscribes on
    // load, so a dropped send during that window is safe to ignore. It also keeps the
    // high-frequency HID forwarder from spamming the console.
  }
};

export { handle, on, emit };
