import { ipcMain } from 'electron';
import { readFile, writeFile } from 'fs/promises';
import { getUserDataPath } from '../lib/paths';
import { loadRom } from '../../../../shared/asset-extraction/rom/rom-loader';
import { floodFillScreen, initEngine, getConnections } from '../../../../shared/game/navigation';
import { findBorderBundles } from '../../../../shared/game/navigation/analysis/border-bundles';
import type { ScreenVariant } from '../../../../shared/game/navigation/types';
import type { TileAttrContext } from '../../../../shared/game/navigation/tile-attrs';

function registerConnectionHandlers(): void {
  ipcMain.handle('connectionReview:load', async () => {
    try {
      const data = await readFile(getUserDataPath('connection-review.json'), 'utf-8');
      return JSON.parse(data);
    } catch { return {}; }
  });

  ipcMain.handle('connectionReview:save', async (_e, data: unknown) => {
    await writeFile(getUserDataPath('connection-review.json'), JSON.stringify(data, null, 2), 'utf-8');
  });

  // Nav review data (per-screen connection point reviews with comments)
  ipcMain.handle('navReview:load', async () => {
    try {
      const data = await readFile(getUserDataPath('nav-review.json'), 'utf-8');
      return JSON.parse(data);
    } catch { return {}; }
  });

  ipcMain.handle('navReview:save', async (_e, data: unknown) => {
    await writeFile(getUserDataPath('nav-review.json'), JSON.stringify(data, null, 2), 'utf-8');
  });

  // Run flood fill for a specific screen (CPU-intensive, runs in main process)
  let romCache: { path: string; rom: ReturnType<typeof loadRom> } | null = null;

  ipcMain.handle('connectionReview:floodFill', async (_e, romFile: string, screenIndex: number, items?: string[], variant?: ScreenVariant, startPos?: { row: number; col: number }, tileContext?: TileAttrContext, rawAttrGrid?: number[][], dynamicBlockers?: Array<{ row: number; col: number }>) => {
    try {
      const romPath = getUserDataPath('roms', romFile);

      // Cache the ROM to avoid reloading on every screen
      if (!romCache || romCache.path !== romPath) {
        romCache = { path: romPath, rom: loadRom(romPath) };
        initEngine(romCache.rom);
      }

      const inventory = new Set(items ?? []);
      const result = floodFillScreen(romCache.rom, screenIndex, inventory, startPos, variant, tileContext ?? 'overworld', rawAttrGrid, dynamicBlockers);
      const connections = getConnections(result);
      const bundles = findBorderBundles(result);

      // Serialize (boolean[][] → flat arrays for IPC transfer)
      return {
        screenIndex: result.screenIndex,
        tileContext: result.tileContext,
        startPos: result.startPos,
        reachable: result.reachable.map(row => row.map(v => v ? 1 : 0)),
        transitions: result.transitions,
        reachableCount: result.reachableCount,
        totalTiles: result.totalTiles,
        entrances: result.entrances,
        ledges: result.ledges,
        attrGrid: result.attrGrid,
        reqGrid: result.reqGrid,
        dynamicBlockerCells: result.dynamicBlockerCells,
        borders: result.borders,
        connections,
        bundles,
      };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  });
}

export { registerConnectionHandlers };
