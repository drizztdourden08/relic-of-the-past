/* @layer electron-main @kind logic */
import { getUserDataPath } from '@drizztdourden08/brock-electron/main';

const prefsPath = (): string => getUserDataPath('config', 'updater.json');

export { prefsPath };
