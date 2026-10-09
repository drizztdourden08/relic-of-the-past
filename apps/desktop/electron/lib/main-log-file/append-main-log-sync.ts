/* @layer electron-main @kind logic */
import { appendFileSync } from 'fs';
import type { MainLogLevel } from './main-log-file.type';
import { bestEffort } from './best-effort';
import { formatMainLogLine } from './format-main-log-line';
import { holdMainLogLine } from './hold-main-log-line';
import { isMainLogReady } from './is-main-log-ready';
import { mainLogPath } from './main-log-path';
import { openMainLog } from './open-main-log';

const appendMainLogSync = (level: MainLogLevel, message: string): void => {
  const line = formatMainLogLine(level, message);
  if (!isMainLogReady()) {
    holdMainLogLine(line);
    return;
  }
  openMainLog();
  bestEffort(() => appendFileSync(mainLogPath(), `${line}\n`, 'utf-8'));
};

export { appendMainLogSync };
