/* @layer electron-main @kind logic */
import { app } from 'electron';
import { isUpdateHarness } from './is-update-harness';

const canCheckForUpdates = (): boolean => app.isPackaged || isUpdateHarness();

export { canCheckForUpdates };
