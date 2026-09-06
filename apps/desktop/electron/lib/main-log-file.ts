/* @layer electron-main @kind logic */
/**
 * The main process's on-disk log (Data/debug/main-console.log). One module owns its
 * path, its line format and both append paths, so the dev console mirror and the
 * crash forensics land in the same file in the same shape.
 *
 * The file is scoped to one launch: the first write of the process truncates it. A
 * line produced before initPaths() has run (the path is relative until then, and a
 * write would land beside the executable) is held back and flushed ahead of the first
 * line that can reach the disk, so an early failure is not lost. Every write is
 * best-effort: a logging failure must never surface into the app it observes.
 */
import { appendFile } from 'fs/promises';
import { appendFileSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, isAbsolute } from 'path';
import { getUserDataPath } from './paths';

type MainLogLevel = 'log' | 'info' | 'warn' | 'error';

const PENDING_CAP = 200;

const mainLogPath = (): string => getUserDataPath('debug', 'main-console.log');

const formatMainLogLine = (level: MainLogLevel, message: string): string =>
  `[${new Date().toISOString()}] [${level}] ${message}`;

const isMainLogReady = (): boolean => isAbsolute(mainLogPath());

let isOpen = false;
const pending: string[] = [];

/** Truncate the file for this launch and flush anything held back. Idempotent, sync. */
const openMainLog = (): void => {
  if (isOpen) return;
  isOpen = true;
  try {
    mkdirSync(dirname(mainLogPath()), { recursive: true });
    writeFileSync(mainLogPath(), pending.length ? `${pending.join('\n')}\n` : '', 'utf-8');
  } catch {
    // Best-effort by design.
  }
  pending.length = 0;
};

const hold = (line: string): void => {
  if (pending.length < PENDING_CAP) pending.push(line);
};

const appendMainLog = (level: MainLogLevel, message: string): void => {
  const line = formatMainLogLine(level, message);
  if (!isMainLogReady()) {
    hold(line);
    return;
  }
  openMainLog();
  appendFile(mainLogPath(), `${line}\n`, 'utf-8').catch(() => {});
};

/** Synchronous append, for handlers that run as the last thing before the process dies. */
const appendMainLogSync = (level: MainLogLevel, message: string): void => {
  const line = formatMainLogLine(level, message);
  if (!isMainLogReady()) {
    hold(line);
    return;
  }
  openMainLog();
  try {
    appendFileSync(mainLogPath(), `${line}\n`, 'utf-8');
  } catch {
    // Best-effort by design.
  }
};

export { appendMainLog, appendMainLogSync, mainLogPath, openMainLog };
export type { MainLogLevel };
