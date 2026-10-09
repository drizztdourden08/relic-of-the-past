/* @layer electron-main @kind logic */
import { appendFile, writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import type { BrowserWindow } from 'electron';
import { appendMainLog, mainLogPath, openMainLog } from './main-log-file';
import { getUserDataPath } from './paths';

const timestamp = (): string => new Date().toISOString();

const appendLine = (file: string, line: string): void => {
  appendFile(file, `${line}\n`, 'utf-8').catch(() => {});
};

const resetLogFile = async (file: string): Promise<void> => {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, '', 'utf-8');
};

const installMainConsoleMirror = (): void => {
  for (const level of ['log', 'warn', 'error', 'info'] as const) {
    const original = console[level].bind(console);
    console[level] = (...args: unknown[]) => {
      original(...args);
      appendMainLog(level, args.map(String).join(' '));
    };
  }
};

const installRendererConsoleMirror = (mainWindow: BrowserWindow, rendererLogPath: string): void => {
  mainWindow.webContents.on('console-message', (event) => {
    appendLine(rendererLogPath, `[${timestamp()}] [${event.level}] ${event.message} (${event.sourceId}:${event.lineNumber})`);
  });
};

const installDevFileLogging = async (mainWindow: BrowserWindow): Promise<void> => {
  const rendererLogPath = getUserDataPath('debug', 'renderer-console.log');
  openMainLog();
  await resetLogFile(rendererLogPath);
  installMainConsoleMirror();
  installRendererConsoleMirror(mainWindow, rendererLogPath);
  console.log(`[dev-file-logger] Mirroring console output to ${mainLogPath()} and ${rendererLogPath}`);
};

export { installDevFileLogging };
