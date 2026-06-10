import { handle } from '../lib/ipc/handle';
import { readFile, writeFile, access } from 'fs/promises';
import { getUserDataPath } from '../lib/paths';
import { hasAssetForRom, getAssetFileName } from '../roms/store';
import { logToRenderer } from '../lib/renderer-log';
import { toArrayBufferOrNull } from '../lib/buffer';
import { loadRom } from '@shared/asset-extraction/rom/rom-loader';
import { compileResources } from '@shared/asset-extraction/compile-resources';

const registerAssetHandlers = () => {
  handle('assets:check', (_event, romFile: string) => hasAssetForRom(romFile));

  handle('assets:load', async (_event, romFile: string) => {
    try {
      return toArrayBufferOrNull(await readFile(getUserDataPath('assets', getAssetFileName(romFile))));
    } catch {
      return null;
    }
  });

  handle('assets:extract', async (_event, romFile: string) => {
    const localRomPath = getUserDataPath('roms', romFile);
    const assetFile = getAssetFileName(romFile);
    const cachedAssetsPath = getUserDataPath('assets', assetFile);

    try {
      await access(localRomPath);
    } catch {
      return { success: false, error: `ROM file not found: ${romFile}` };
    }

    logToRenderer('app', 'info', `Compiling assets from ${romFile}...`);

    try {
      const rom = loadRom(localRomPath);
      logToRenderer('core', 'info', `ROM loaded: ${rom.language} (${rom.description})`);
      const dat = compileResources(rom);
      await writeFile(cachedAssetsPath, dat);
      logToRenderer('app', 'info', `Assets cached as ${assetFile} (${(dat.length / 1024).toFixed(0)} KB)`);
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logToRenderer('error', 'error', `Asset compilation failed: ${msg}`);
      return { success: false, error: msg };
    }
  });
};

export { registerAssetHandlers };
