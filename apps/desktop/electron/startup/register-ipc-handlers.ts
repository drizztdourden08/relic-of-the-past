/* @layer electron-main @kind logic */
import { is } from '@electron-toolkit/utils';
import { IPC_HANDLERS } from './ipc-handlers.constants';

const registerIpcHandlers = (): void => {
  for (const { register, devOnly } of IPC_HANDLERS) {
    if (!devOnly || is.dev) register();
  }
};

export { registerIpcHandlers };
