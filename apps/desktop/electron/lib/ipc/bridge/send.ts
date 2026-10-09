/* @layer electron-main @kind logic */
import { ipcRenderer } from 'electron';
import type { SendContract } from '@shared/ipc';

const send = <K extends keyof SendContract>(channel: K, ...args: Parameters<SendContract[K]>): void => {
  ipcRenderer.send(channel, ...args);
};

export { send };
