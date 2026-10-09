/* @layer electron-main @kind logic */
import { getMainWindow } from '../window';
import { emit } from './ipc/handle';
import type { LogLevel } from './renderer-log.type';

const logToRenderer = (channel: string, level: LogLevel, message: string): void => {
  const win = getMainWindow();
  if (win) emit(win, 'log:entry', { channel, level, message });
};

export { logToRenderer };
export type { LogLevel };
