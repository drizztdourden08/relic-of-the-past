/* @layer electron-main @kind logic */
import { handle } from '../lib/ipc/handle';
import { readRefreshRate } from './refresh-rate';
import { readStatus, setPreference } from './mode-switch';

const registerDisplayHandlers = (): void => {
  handle('display:getRefreshRate', () => readRefreshRate());
  handle('display:getSyncedRateStatus', () => readStatus());
  handle('display:setSyncedRatePreference', (_event, enabled, targetHz) => {
    setPreference({ enabled, targetHz });
    return readStatus();
  });
};

export { registerDisplayHandlers };
