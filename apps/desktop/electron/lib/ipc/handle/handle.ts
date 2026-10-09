/* @layer electron-main @kind logic */
import { ipcMain } from 'electron';
import type { IpcMainInvokeEvent } from 'electron';
import type { InvokeContract } from '@shared/ipc';

const handle = <K extends keyof InvokeContract>(
  channel: K,
  fn: (event: IpcMainInvokeEvent, ...args: Parameters<InvokeContract[K]>)
    => ReturnType<InvokeContract[K]> | Awaited<ReturnType<InvokeContract[K]>>,
): void => ipcMain.handle(channel, fn as never);

export { handle };
