/* @layer electron-main @kind logic */
/**
 * Compile the optional ALttP GBA supplement beside the normal SNES asset cache.
 * UI/store integration remains separate so the existing SNES-only flow is unchanged.
 */
import { writeFile } from 'fs/promises';
import { compileGbaAlttpSupplement } from '@shared/asset-extraction/compile-resources-gba-alttp';
import { loadGbaAlttpRom } from '@shared/asset-extraction/rom/load-gba-rom-file';
import { errMessage } from '../lib/result';

type CompileGbaAlttpResult = { success: boolean; error?: string };

const compileGbaAlttpAssets = async (
  gbaRomPath: string,
  supplementPath: string,
): Promise<CompileGbaAlttpResult> => {
  try {
    const rom = loadGbaAlttpRom(gbaRomPath);
    await writeFile(supplementPath, compileGbaAlttpSupplement(rom));
    return { success: true };
  } catch (error) {
    return { success: false, error: errMessage(error) };
  }
};

export { compileGbaAlttpAssets };
export type { CompileGbaAlttpResult };
