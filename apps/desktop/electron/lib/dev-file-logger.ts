/* @layer electron-main @kind logic */
/**
 * Dev-only: mirrors main-process console output and renderer console output to
 * disk continuously, so a hard crash still leaves the last thing that happened
 * on disk to read back — terminal scrollback isn't searchable and may not have
 * been visible when the crash happened. Never wired up in a packaged build.
 */
import { appendFile, writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import type { BrowserWindow } from 'electron';
import { getUserDataPath } from './paths';

const timestamp = (): string => new Date().toISOString();

const appendLine = (file: string, line: string): void => {
  // Best-effort — a logging failure must never break the app it's logging.
  appendFile(file, `${line}\n`, 'utf-8').catch(() => {});
};

const resetLogFile = async (file: string): Promise<void> => {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, '', 'utf-8');
};

/** Wraps console.log/warn/error/info so every call still behaves normally but
 *  also lands in mainLogPath. */
const installMainConsoleMirror = (mainLogPath: string): void => {
  for (const level of ['log', 'warn', 'error', 'info'] as const) {
    const original = console[level].bind(console);
    console[level] = (...args: unknown[]) => {
      original(...args);
      appendLine(mainLogPath, `[${timestamp()}] [${level}] ${args.map(String).join(' ')}`);
    };
  }
};

/** Renderer console output reaches the main process via the existing
 *  console-message event — no renderer-side code changes needed. */
const installRendererConsoleMirror = (mainWindow: BrowserWindow, rendererLogPath: string): void => {
  mainWindow.webContents.on('console-message', (event) => {
    appendLine(rendererLogPath, `[${timestamp()}] [${event.level}] ${event.message} (${event.sourceId}:${event.lineNumber})`);
  });
};

// getUserDataPath() is only resolved once initPaths() has run (see main.ts), so
// these are computed lazily here — never at module load time.
const installDevFileLogging = async (mainWindow: BrowserWindow): Promise<void> => {
  const mainLogPath = getUserDataPath('debug', 'main-console.log');
  const rendererLogPath = getUserDataPath('debug', 'renderer-console.log');
  await Promise.all([resetLogFile(mainLogPath), resetLogFile(rendererLogPath)]);
  installMainConsoleMirror(mainLogPath);
  installRendererConsoleMirror(mainWindow, rendererLogPath);
  console.log(`[dev-file-logger] Mirroring console output to ${mainLogPath} and ${rendererLogPath}`);
};

export { installDevFileLogging };
