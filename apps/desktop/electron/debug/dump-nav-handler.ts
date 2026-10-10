/* @layer electron-main @kind logic */
import { app } from 'electron';
import { join } from 'path';
import { handle } from '@drizztdourden08/brock-electron/main';
import { getWorkspaceRoot } from '../screen-editor/workspace-root';
import { writeFile, mkdir } from 'fs/promises';

const parseDumpNavSlot = (): number | string | null => {
  for (const arg of process.argv) {
    const value = /^--dump-nav=(.+)$/.exec(arg)?.[1];
    if (value !== undefined) return /^\d+$/.test(value) ? parseInt(value, 10) : value;
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
