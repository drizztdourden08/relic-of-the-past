import { ipcMain } from 'electron';
import { readFile, writeFile, access } from 'fs/promises';
import { getUserDataPath } from '../lib/paths';
import { hasAssetForRom, getAssetFileName } from '../roms/store';
import { getMainWindow } from '../window';
import { loadRom } from '../../../../shared/asset-extraction/rom/rom-loader';
import { compileResources } from '../../../../shared/asset-extraction/compile-resources';

export const registerAssetHandlers = () => {
  ipcMain.handle('assets:check', async (_event, romFile: string) => {
    return hasAssetForRom(romFile);
  });

  ipcMain.handle('assets:load', async (_event, romFile: string) => {
    const assetFile = getAssetFileName(romFile);
    try {
      const data = await readFile(getUserDataPath('assets', assetFile));
      return data.buffer;
    } catch {
      return null;
    }
  });

  ipcMain.handle('assets:extract', async (_event, romFile: string) => {
    const localRomPath = getUserDataPath('roms', romFile);
    const assetFile = getAssetFileName(romFile);
    const cachedAssetsPath = getUserDataPath('assets', assetFile);

    try {
      await access(localRomPath);
    } catch {
      return { success: false, error: `ROM file not found: ${romFile}` };
    }

    const sendLog = (channel: string, level: string, message: string) => {
      getMainWindow()?.webContents.send('log:entry', { channel, level, message });
    };

    sendLog('app', 'info', `Compiling assets from ${romFile}...`);

    try {
      const rom = loadRom(localRomPath);
      sendLog('core', 'info', `ROM loaded: ${rom.language} (${rom.description})`);
      const dat = compileResources(rom);
      await writeFile(cachedAssetsPath, dat);
      sendLog('app', 'info', `Assets cached as ${assetFile} (${(dat.length / 1024).toFixed(0)} KB)`);
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      sendLog('error', 'error', `Asset compilation failed: ${msg}`);
      return { success: false, error: msg };
    }
  });
};
