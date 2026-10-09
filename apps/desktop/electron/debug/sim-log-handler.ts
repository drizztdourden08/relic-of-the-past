/* @layer electron-main @kind logic */
import { app, shell } from 'electron';
import { join } from 'path';
import { appendFile, mkdir, access } from 'fs/promises';
import { handle } from '@drizztdourden08/brock-electron/main';
import { getWorkspaceRoot } from '../screen-editor/workspace-root';
import type { Result } from './sim-log-handler.type';

const sanitizeRunId = (runId: string): string => runId.replace(/[^A-Za-z0-9_-]/g, '_');

const getSimLogDir = (): string => {
  const appRoot = app.isPackaged
    ? join(app.getAppPath(), '../..')
    : getWorkspaceRoot();
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
