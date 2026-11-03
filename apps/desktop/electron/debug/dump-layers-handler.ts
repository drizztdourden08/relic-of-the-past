/* @layer electron-main @kind logic */
import { handle } from '@drizztdourden08/brock-electron/main';
import { writeDebugOutput } from './write-debug-output';

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

  handle('debug:dumpLayers', (_event, data: unknown) => writeDebugOutput('dump-layers', 'dump-layers.json', data));
};

export { registerDumpLayersHandler };
