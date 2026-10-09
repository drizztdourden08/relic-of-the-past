/* @layer electron-main @kind logic */
import { ipcRenderer } from 'electron';
import type { IpcRendererEvent } from 'electron';
import type { EventContract } from '@shared/ipc';

const subscribe = <K extends keyof EventContract>(channel: K, callback: EventContract[K]): (() => void) => {
  const handler = (_event: IpcRendererEvent, ...args: Parameters<EventContract[K]>): void =>
    (callback as (...a: Parameters<EventContract[K]>) => void)(...args);
  ipcRenderer.on(channel, handler);
  return () => { ipcRenderer.removeListener(channel, handler); };
};

export { subscribe };
