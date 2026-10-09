/* @layer electron-main @kind logic */
import { app } from 'electron';
import { getUpdateManager } from './get-update-manager';

const currentVersion = (): string => {
  const manager = getUpdateManager();
  return manager ? manager.getCurrentVersion() : app.getVersion();
};

export { currentVersion };
