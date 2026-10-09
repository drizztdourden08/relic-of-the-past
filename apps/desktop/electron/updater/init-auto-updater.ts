/* @layer electron-main @kind logic */
import type { BrowserWindow } from 'electron';
import { runCheck } from './run-check';
import { canCheckForUpdates, canSelfUpdate } from './update-manager';
import { FIRST_CHECK_DELAY_MS } from './updater.constants';

const initAutoUpdater = (mainWindow: BrowserWindow): void => {
  if (!canSelfUpdate() && !canCheckForUpdates()) return;
  setTimeout(() => {
    runCheck(mainWindow).catch((err) => console.error('[updater] check failed:', err));
  }, FIRST_CHECK_DELAY_MS);
};

export { initAutoUpdater };
