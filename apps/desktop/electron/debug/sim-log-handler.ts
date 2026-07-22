/* @layer electron-main @kind logic */
/**
 * Simulator run log sink.
 *
 * `sim:appendLog` appends one JSONL line per simulator event to
 * debug-output/simulator/<runId>.jsonl; `sim:openLog` reveals that file in the
 * OS file manager. runId is sanitized so it can never escape the simulator
 * log folder.
 */

import { app, shell } from 'electron';
import { join } from 'path';
import { appendFile, mkdir, access } from 'fs/promises';
import { handle } from '../lib/ipc/handle';

type Result = { success: boolean; error?: string };

// Strips anything outside [A-Za-z0-9_-] so a runId can never contain a path
// separator, '..', or a drive letter.
const sanitizeRunId = (runId: string): string => runId.replace(/[^A-Za-z0-9_-]/g, '_');

const getSimLogDir = (): string => {
  const appRoot = app.isPackaged
    ? join(app.getAppPath(), '../..')
    : join(__dirname, '../..');
  return join(appRoot, 'debug-output', 'simulator');
};

const getSimLogPath = (runId: string): string =>
  join(getSimLogDir(), `${sanitizeRunId(runId)}.jsonl`);

const registerSimLogHandlers = (): void => {
  handle('sim:appendLog', async (_event, args: { runId: string; line: string }): Promise<Result> => {
    try {
      await mkdir(getSimLogDir(), { recursive: true });
      await appendFile(getSimLogPath(args.runId), args.line + '\n', 'utf-8');
      return { success: true };
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  });

  handle('sim:openLog', async (_event, args: { runId: string }): Promise<Result> => {
    const path = getSimLogPath(args.runId);
    try {
      await access(path);
    } catch {
      return { success: false, error: `Log file not found: ${path}` };
    }
    shell.showItemInFolder(path);
    return { success: true };
  });
};

export { registerSimLogHandlers };
