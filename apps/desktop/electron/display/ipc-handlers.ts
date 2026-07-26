/* @layer electron-main @kind logic */
import { handle } from '../lib/ipc/handle';
import { readRefreshRate } from './refresh-rate';

const registerDisplayHandlers = (): void => {
  handle('display:getRefreshRate', () => readRefreshRate());
};

export { registerDisplayHandlers };
