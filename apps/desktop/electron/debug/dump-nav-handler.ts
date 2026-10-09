/* @layer electron-main @kind logic */
import { app } from 'electron';
import { join } from 'path';
import { handle } from '../lib/ipc/handle';
import { getWorkspaceRoot } from '../screen-editor/workspace-root';
import { writeFile, mkdir } from 'fs/promises';

const parseDumpNavSlot = (): number | string | null => {
  for (const arg of process.argv) {
    const match = arg.match(/^--dump-nav=(.+)$/);
    if (match) return /^\d+$/.test(match[1]) ? parseInt(match[1], 10) : match[1];
  }
  return null;
};

const registerDumpNavHandler = (): void => {
  const slot = parseDumpNavSlot();

  handle('debug:getDumpNavSlot', () => slot);

  handle('debug:dumpNav', async (_event, data: unknown) => {
    const appRoot = app.isPackaged
      ? join(app.getAppPath(), '../..')
      : getWorkspaceRoot();
    const dir = join(appRoot, 'debug-output');
    await mkdir(dir, { recursive: true });
    const outPath = join(dir, 'dump-nav.json');
    await writeFile(outPath, JSON.stringify(data, null, 2));
    console.log(`[dump-nav] Written to: ${outPath}`);
    return outPath;
  });
};

export { registerDumpNavHandler };
