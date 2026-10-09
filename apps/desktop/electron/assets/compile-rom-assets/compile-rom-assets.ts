/* @layer electron-main @kind logic */
import { writeFile, access } from 'fs/promises';
import { loadRom } from '@shared/asset-extraction/rom/load-rom-file';
import { compileResources } from '@shared/asset-extraction/compile-resources';
import { getUserDataPath } from '@drizztdourden08/brock-electron/main';
import { datName } from '@shared/storage/assets';
import { logToRenderer } from '../../lib/renderer-log';
import { loadCompiledLanguages } from '../load-compiled-languages';
import { errMessage } from '../../lib/result';
import type { CompileResult } from './compile-rom-assets.type';

const compileRomAssets = async (romFile: string): Promise<CompileResult> => {
  const localRomPath = getUserDataPath('roms', romFile);
  try {
    await access(localRomPath);
  } catch {
    return { success: false, error: `ROM file not found: ${romFile}` };
  }

  try {
    const rom = loadRom(localRomPath);
    const extraLanguages = await loadCompiledLanguages();
    logToRenderer('core', 'info', `ROM loaded: ${rom.language} (${rom.description})`);
    if (extraLanguages.length > 0) {
      logToRenderer('app', 'info', `Baking ${extraLanguages.length} language set(s): ${extraLanguages.map((e) => e.code).join(', ')}`);
    }
    const dat = compileResources(rom, { extraLanguages });
    const assetFile = datName(romFile);
    await writeFile(getUserDataPath('assets', assetFile), dat);
    logToRenderer('app', 'info', `Assets cached as ${assetFile} (${(dat.length / 1024).toFixed(0)} KB)`);
    return { success: true };
  } catch (err) {
    const msg = errMessage(err);
    logToRenderer('error', 'error', `Asset compilation failed: ${msg}`);
    return { success: false, error: msg };
  }
};

export { compileRomAssets };
