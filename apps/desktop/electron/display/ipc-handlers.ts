/* @layer electron-main @kind logic */
import { handle } from '../lib/ipc/handle';
import { readRefreshRate } from './refresh-rate';
import { readStatus, setPreference, applyPermanently } from './mode-switch';

const registerDisplayHandlers = (): void => {
  handle('display:getRefreshRate', () => readRefreshRate());
  handle('display:getSyncedRateStatus', () => readStatus());
  handle('display:setSyncedRatePreference', (_event, enabled, targetHz) => {
    setPreference({ enabled, targetHz });
    return readStatus();
  });
  handle('display:applyRefreshRate', (_event, hz) => applyPermanently(hz));
};

export { registerDisplayHandlers };
