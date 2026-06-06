/* @layer electron-main @kind logic */
/**
 * Debug CLI: --dump-layers=N [--hover-tile=col,row]
 *
 * Loads save state slot N, dumps the dual-layer collision grid
 * (the exact same data used by the navigation overlay) to a JSON file,
 * then exits the app.
 *
 * With --hover-tile=col,row: also opens the navigation overlay, hovers
 * the specified tile to trigger the tooltip, and takes a screenshot.
 *
 * Usage:
 *   npx electron dist/electron/main.js --muted --dump-layers=6 --hover-tile=45,31
 *
 * Output: writes to <project>/debug-output/dump-layers.json
 */

import { ipcMain, app } from 'electron';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';

const parseDumpLayersSlot = (): number | null => {
  for (const arg of process.argv) {
    const match = arg.match(/^--dump-layers=(\d+)$/);
    if (match) return parseInt(match[1], 10);
  }
  return null;
};

const parseHoverTile = (): { col: number; row: number } | null => {
  for (const arg of process.argv) {
    const match = arg.match(/^--hover-tile=(\d+),(\d+)$/);
    if (match) return { col: parseInt(match[1], 10), row: parseInt(match[2], 10) };
  }
  return null;
};

const registerDumpLayersHandler = (): void => {
  const slot = parseDumpLayersSlot();
  const hoverTile = parseHoverTile();

  ipcMain.handle('debug:getDumpLayersSlot', () => slot);
  ipcMain.handle('debug:getHoverTile', () => hoverTile);

  ipcMain.handle('debug:dumpLayers', async (_event, data: unknown) => {
    const appRoot = app.isPackaged
      ? join(app.getAppPath(), '../..')
      : join(__dirname, '../..');
    const dir = join(appRoot, 'debug-output');
    await mkdir(dir, { recursive: true });
    const outPath = join(dir, 'dump-layers.json');
    await writeFile(outPath, JSON.stringify(data, null, 2));
    console.log(`[dump-layers] Written to: ${outPath}`);
    return outPath;
  });
};

export { registerDumpLayersHandler };
