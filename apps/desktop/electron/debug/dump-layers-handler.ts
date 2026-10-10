/* @layer electron-main @kind logic */
import { app } from 'electron';
import { join } from 'path';
import { handle } from '@drizztdourden08/brock-electron/main';
import { getWorkspaceRoot } from '../screen-editor/workspace-root';
import { writeFile, mkdir } from 'fs/promises';

const parseDumpLayersSlot = (): number | null => {
  for (const arg of process.argv) {
    const slot = /^--dump-layers=(\d+)$/.exec(arg)?.[1];
    if (slot !== undefined) return parseInt(slot, 10);
  }
  return null;
};

const parseHoverTile = (): { col: number; row: number } | null => {
  for (const arg of process.argv) {
    const [, col, row] = /^--hover-tile=(\d+),(\d+)$/.exec(arg) ?? [];
    if (col !== undefined && row !== undefined) return { col: parseInt(col, 10), row: parseInt(row, 10) };
  }
  return null;
};

const registerDumpLayersHandler = (): void => {
  const slot = parseDumpLayersSlot();
  const hoverTile = parseHoverTile();

  handle('debug:getDumpLayersSlot', () => slot);
  handle('debug:getHoverTile', () => hoverTile);

  handle('debug:dumpLayers', async (_event, data: unknown) => {
    const appRoot = app.isPackaged
      ? join(app.getAppPath(), '../..')
      : getWorkspaceRoot();
    const dir = join(appRoot, 'debug-output');
    await mkdir(dir, { recursive: true });
    const outPath = join(dir, 'dump-layers.json');
    await writeFile(outPath, JSON.stringify(data, null, 2));
    console.log(`[dump-layers] Written to: ${outPath}`);
    return outPath;
  });
};

export { registerDumpLayersHandler };
