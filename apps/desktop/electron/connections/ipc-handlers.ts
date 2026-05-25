import { ipcMain } from 'electron';
import { readFile, writeFile } from 'fs/promises';
import { getUserDataPath } from '../lib/paths';
import { loadRom } from '../../../../shared/asset-extraction/rom/rom-loader';
import { floodFillScreen, initEngine, getConnections } from '../../../../shared/game/navigation';

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

  // Run flood fill for a specific screen (CPU-intensive, runs in main process)
  let romCache: { path: string; rom: ReturnType<typeof loadRom> } | null = null;

  ipcMain.handle('connectionReview:floodFill', async (_e, romFile: string, screenIndex: number, items?: string[]) => {
    try {
      const romPath = getUserDataPath('roms', romFile);

      // Cache the ROM to avoid reloading on every screen
      if (!romCache || romCache.path !== romPath) {
        romCache = { path: romPath, rom: loadRom(romPath) };
        initEngine(romCache.rom);
      }

      const inventory = new Set(items ?? []);
      const result = floodFillScreen(romCache.rom, screenIndex, inventory);
      const connections = getConnections(result);

      // Serialize (boolean[][] → flat arrays for IPC transfer)
      return {
        screenIndex: result.screenIndex,
        reachable: result.reachable.map(row => row.map(v => v ? 1 : 0)),
        transitions: result.transitions,
        reachableCount: result.reachableCount,
        totalTiles: result.totalTiles,
        entrances: result.entrances,
        ledges: result.ledges,
        attrGrid: result.attrGrid,
        reqGrid: result.reqGrid,
        borders: result.borders,
        connections,
      };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  });
}

export { registerConnectionHandlers };
