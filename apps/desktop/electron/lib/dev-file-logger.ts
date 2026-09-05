/* @layer electron-main @kind logic */
/**
 * Dev-only: mirrors main and renderer console output to disk continuously, so a
 * hard crash leaves the last thing that happened on disk. Never wired up in a
 * packaged build.
 */
import { appendFile, writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import type { BrowserWindow } from 'electron';
import { getUserDataPath } from './paths';

const timestamp = (): string => new Date().toISOString();

const appendLine = (file: string, line: string): void => {
  // A logging failure must never break the app it's logging.
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

/** Renderer console output arrives via the console-message event; no renderer changes. */
const installRendererConsoleMirror = (mainWindow: BrowserWindow, rendererLogPath: string): void => {
  mainWindow.webContents.on('console-message', (event) => {
    appendLine(rendererLogPath, `[${timestamp()}] [${event.level}] ${event.message} (${event.sourceId}:${event.lineNumber})`);
  });
};

// getUserDataPath() only resolves once initPaths() has run, so never at module load.
const installDevFileLogging = async (mainWindow: BrowserWindow): Promise<void> => {
  const mainLogPath = getUserDataPath('debug', 'main-console.log');
  const rendererLogPath = getUserDataPath('debug', 'renderer-console.log');
  await Promise.all([resetLogFile(mainLogPath), resetLogFile(rendererLogPath)]);
  installMainConsoleMirror(mainLogPath);
  installRendererConsoleMirror(mainWindow, rendererLogPath);
  console.log(`[dev-file-logger] Mirroring console output to ${mainLogPath} and ${rendererLogPath}`);
};

export { installDevFileLogging };
