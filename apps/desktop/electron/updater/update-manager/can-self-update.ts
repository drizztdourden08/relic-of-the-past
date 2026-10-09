/* @layer electron-main @kind logic */
import { getUpdateManager } from './get-update-manager';

const canSelfUpdate = (): boolean => getUpdateManager() !== null;

export { canSelfUpdate };
