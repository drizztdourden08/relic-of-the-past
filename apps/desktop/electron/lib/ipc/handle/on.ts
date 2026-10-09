/* @layer electron-main @kind logic */
import { ipcMain } from 'electron';
import type { IpcMainEvent } from 'electron';
import type { SendContract } from '@shared/ipc';

const on = <K extends keyof SendContract>(
  channel: K,
  fn: (event: IpcMainEvent, ...args: Parameters<SendContract[K]>) => void,
): void => {
  ipcMain.on(channel, fn as never);
};

export { on };
