/* @layer electron-main @kind logic */
import { getUserDataPath } from '../paths';

const mainLogPath = (): string => getUserDataPath('debug', 'main-console.log');

export { mainLogPath };
