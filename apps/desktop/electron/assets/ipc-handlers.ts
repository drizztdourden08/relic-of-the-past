import { handle } from '../lib/ipc/handle';
import { readFile } from 'fs/promises';
import { getUserDataPath } from '../lib/paths';
import { hasAssetForRom, getAssetFileName } from '../roms/store';
import { logToRenderer } from '../lib/renderer-log';
import { toArrayBufferOrNull } from '../lib/buffer';
import { compileRomAssets } from './compile-rom-assets';

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
    logToRenderer('app', 'info', `Compiling assets from ${romFile}...`);
    return compileRomAssets(romFile);
  });
};

export { registerAssetHandlers };
