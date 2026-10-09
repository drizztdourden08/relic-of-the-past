/* @layer electron-main @kind logic */
import { isAbsolute } from 'path';
import { mainLogPath } from './main-log-path';

const isMainLogReady = (): boolean => isAbsolute(mainLogPath());

export { isMainLogReady };
