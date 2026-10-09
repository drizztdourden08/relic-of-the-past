/* @layer electron-main @kind logic */
import { handle } from '@drizztdourden08/brock-electron/main';
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
