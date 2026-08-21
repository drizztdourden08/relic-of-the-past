/* @layer electron-main @kind logic */
/**
 * Compile a ROM's zelda3_assets.dat, baking in every extracted language pack so the
 * core can switch language at runtime via the INI. Also exposes a recompile pass used
 * when the set of language packs changes (extract / delete).
 */
import { writeFile, access, readdir } from 'fs/promises';
import { loadRom } from '@shared/asset-extraction/rom/load-rom-file';
import { compileAlttpAssetSet } from '@shared/asset-extraction/compile-alttp-asset-set';
import { loadGbaAlttpRom } from '@shared/asset-extraction/rom/load-gba-rom-file';
import { getUserDataPath } from '../lib/paths';
import { getAssetFileName, hasAssetForRom, listRoms } from '../roms/store';
import { logToRenderer } from '../lib/renderer-log';
import { loadPackedLanguages } from '../languages/language-pack';
import { errMessage } from '../lib/result';

type CompileResult = { success: boolean; error?: string };

/** Build (or rebuild) the asset blob for one ROM, including all extracted languages. */
const compileRomAssets = async (romFile: string): Promise<CompileResult> => {
  const localRomPath = getUserDataPath('roms', romFile);
  try {
    await access(localRomPath);
  } catch {
    return { success: false, error: `ROM file not found: ${romFile}` };
  }

  try {
    const rom = loadRom(localRomPath);
    const extraLanguages = await loadPackedLanguages();
    logToRenderer('core', 'info', `ROM loaded: ${rom.language} (${rom.description})`);
    if (extraLanguages.length > 0) {
      logToRenderer('app', 'info', `Baking ${extraLanguages.length} language pack(s): ${extraLanguages.map((e) => e.code).join(', ')}`);
    }
    const gbaFile = (await readdir(getUserDataPath('roms'))).find(file => /\.gba$/i.test(file));
    const set = compileAlttpAssetSet({
      snes: rom,
      gbaAlttp: gbaFile ? loadGbaAlttpRom(getUserDataPath('roms', gbaFile)) : undefined,
    }, { extraLanguages });
    const dat = set.gbaSupplement ? Buffer.concat([set.base, set.gbaSupplement]) : set.base;
    const assetFile = getAssetFileName(romFile);
    await writeFile(getUserDataPath('assets', assetFile), dat);
    logToRenderer('app', 'info', `Assets cached as ${assetFile} (${(dat.length / 1024).toFixed(0)} KB)`);
    return { success: true };
  } catch (err) {
    const msg = errMessage(err);
    logToRenderer('error', 'error', `Asset compilation failed: ${msg}`);
    return { success: false, error: msg };
  }
};

/** Recompile every ROM that already has a cached blob (after a language pack changes). */
const recompileAllAssets = async (): Promise<void> => {
  const roms = await listRoms();
  for (const romFile of roms) {
    if (await hasAssetForRom(romFile)) {
      await compileRomAssets(romFile);
    }
  }
};

export { compileRomAssets, recompileAllAssets };
