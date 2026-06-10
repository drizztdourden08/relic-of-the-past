/* @layer electron-main @kind logic */
import { app } from 'electron';
import { handle } from '../lib/ipc/handle';

const registerAppHandlers = (): void => {
  handle('app:getUserDataPath', () => app.getPath('userData'));
};

export { registerAppHandlers };
