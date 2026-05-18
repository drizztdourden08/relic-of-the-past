import { join, basename, extname } from 'path';
import { ipcMain } from 'electron';
import { readFile, readdir, mkdir, writeFile, access, rm } from 'fs/promises';
import { getUserDataPath } from '../lib/paths';
import { getMainWindow } from '../window';
import { extractAllItemSprites } from '../../../../shared/asset-extraction/item-sprites/extract-items';
import spriteDefinitions from '../../../../shared/game/sprites/definitions.json';

function spriteDir(romFile: string): string {
  const stem = basename(romFile, extname(romFile));
  return getUserDataPath('sprites', stem);
}

export function registerSpriteHandlers(): void {
  ipcMain.handle('sprites:extract', async (_event, romFile: string) => {
    const localRomPath = getUserDataPath('roms', romFile);
    const outDir = spriteDir(romFile);

    try {
      await access(localRomPath);
    } catch {
      return { success: false, error: `ROM file not found: ${romFile}` };
    }

    await mkdir(outDir, { recursive: true });

    const sendLog = (channel: string, level: string, message: string) => {
      getMainWindow()?.webContents.send('log:entry', { channel, level, message });
    };

    sendLog('app', 'info', `Extracting sprites from ${romFile}...`);

    try {
      const result = extractAllItemSprites(localRomPath, outDir, spriteDefinitions.sprites as never);
      if (result.errors.length > 0) {
        for (const err of result.errors) {
          sendLog('core', 'error', err);
        }
      }
      sendLog('app', 'info', `Sprites extracted: ${result.total} files (${result.counts.hud} HUD, ${result.counts.receipt} receipt, ${result.counts.drop} drop)`);
      if (result.removedStale > 0) {
        sendLog('app', 'info', `Removed ${result.removedStale} stale sprite files`);
      }
      return { success: true, count: result.total };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      sendLog('error', 'error', `Sprite extraction failed: ${msg}`);
      return { success: false, error: msg };
    }
  });

  ipcMain.handle('sprites:check', async (_e, romFile: string) => {
    const outDir = spriteDir(romFile);
    try {
      const files = await readdir(outDir);
      const pngCount = files.filter(f => f.endsWith('.png')).length;
      return { extracted: pngCount > 0, count: pngCount };
    } catch {
      return { extracted: false, count: 0 };
    }
  });

  ipcMain.handle('sprites:delete', async (_e, romFile: string) => {
    const outDir = spriteDir(romFile);
    try {
      await rm(outDir, { recursive: true, force: true });
      return { success: true };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
  });

  ipcMain.handle('sprites:getPath', async (_e, romFile: string, file: string) => {
    return join(spriteDir(romFile), `${file}.png`);
  });

  // Sprite debug data
  ipcMain.handle('spriteDebug:load', async () => {
    try {
      const data = await readFile(getUserDataPath('sprite-debug.json'), 'utf-8');
      return JSON.parse(data);
    } catch { return {}; }
  });
  ipcMain.handle('spriteDebug:save', async (_e, data: unknown) => {
    await writeFile(getUserDataPath('sprite-debug.json'), JSON.stringify(data, null, 2), 'utf-8');
  });

  // Sprite review data
  ipcMain.handle('spriteReview:load', async () => {
    try {
      const data = await readFile(getUserDataPath('sprite-review.json'), 'utf-8');
      return JSON.parse(data);
    } catch { return {}; }
  });
  ipcMain.handle('spriteReview:save', async (_e, data: unknown) => {
    await writeFile(getUserDataPath('sprite-review.json'), JSON.stringify(data, null, 2), 'utf-8');
  });
}
