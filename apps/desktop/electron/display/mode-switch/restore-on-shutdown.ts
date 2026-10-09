/* @layer electron-main @kind logic */
import { restoreRate } from './restore-rate';

const restoreOnShutdown = (): void => restoreRate();

export { restoreOnShutdown };
