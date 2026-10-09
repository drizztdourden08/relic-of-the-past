/* @layer electron-main @kind logic */
import type { MainLogLevel } from './main-log-file.type';

const formatMainLogLine = (level: MainLogLevel, message: string): string =>
  `[${new Date().toISOString()}] [${level}] ${message}`;

export { formatMainLogLine };
