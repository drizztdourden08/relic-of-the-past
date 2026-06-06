/**
 * Debug CLI: --dump-nav=N
 *
 * Loads save state slot N, dumps navigation widget state (entrances,
 * screen detection, transitions) to debug-output/dump-nav.json, then exits.
 *
 * Usage:
 *   npx electron dist/electron/main.js --muted --dump-nav=1
 */

import { ipcMain, app } from 'electron';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';

const parseDumpNavSlot = (): number | null => {
  for (const arg of process.argv) {
    const match = arg.match(/^--dump-nav=(\d+)$/);
    if (match) return parseInt(match[1], 10);
  }
  return null;
};

const registerDumpNavHandler = (): void => {
  const slot = parseDumpNavSlot();

  ipcMain.handle('debug:getDumpNavSlot', () => slot);

  ipcMain.handle('debug:dumpNav', async (_event, data: unknown) => {
    const appRoot = app.isPackaged
      ? join(app.getAppPath(), '../..')
      : join(__dirname, '../..');
    const dir = join(appRoot, 'debug-output');
    await mkdir(dir, { recursive: true });
    const outPath = join(dir, 'dump-nav.json');
    await writeFile(outPath, JSON.stringify(data, null, 2));
    console.log(`[dump-nav] Written to: ${outPath}`);
    return outPath;
  });
};

export { registerDumpNavHandler };
