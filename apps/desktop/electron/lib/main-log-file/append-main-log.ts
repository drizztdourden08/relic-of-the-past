/* @layer electron-main @kind logic */
import { appendFile } from 'fs/promises';
import type { MainLogLevel } from './main-log-file.type';
import { formatMainLogLine } from './format-main-log-line';
import { holdMainLogLine } from './hold-main-log-line';
import { isMainLogReady } from './is-main-log-ready';
import { mainLogPath } from './main-log-path';
import { openMainLog } from './open-main-log';

const appendMainLog = (level: MainLogLevel, message: string): void => {
  const line = formatMainLogLine(level, message);
  if (!isMainLogReady()) {
    holdMainLogLine(line);
    return;
  }
  openMainLog();
  appendFile(mainLogPath(), `${line}\n`, 'utf-8').catch(() => {});
};

export { appendMainLog };
