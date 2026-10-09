/* @layer electron-main @kind logic */
import { getUserDataPath } from '../../lib/paths';

const prefsPath = (): string => getUserDataPath('config', 'updater.json');

export { prefsPath };
