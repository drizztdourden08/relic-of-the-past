/* @layer electron-main @kind logic */
/** Forward a log line to the renderer's in-app log console (the 'log:entry' channel). */
import { getMainWindow } from '../window';
import { emit } from './ipc/handle';

type LogLevel = 'info' | 'warn' | 'error';

const logToRenderer = (channel: string, level: LogLevel, message: string): void => {
  const win = getMainWindow();
  if (win) emit(win, 'log:entry', { channel, level, message });
};

export { logToRenderer };
export type { LogLevel };
