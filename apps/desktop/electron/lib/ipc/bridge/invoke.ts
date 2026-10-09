/* @layer electron-main @kind logic */
import { ipcRenderer } from 'electron';
import type { InvokeContract } from '@shared/ipc';

const invoke = <K extends keyof InvokeContract>(channel: K, ...args: Parameters<InvokeContract[K]>): ReturnType<InvokeContract[K]> =>
  ipcRenderer.invoke(channel, ...args) as ReturnType<InvokeContract[K]>;

export { invoke };
