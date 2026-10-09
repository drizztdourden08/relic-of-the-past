/* @layer electron-main @kind logic */
import { runningInstalls } from './running-installs';

const isInstalling = (itemId: string): boolean => runningInstalls.has(itemId);

export { isInstalling };
