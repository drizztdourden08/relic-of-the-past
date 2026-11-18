/* @layer renderer-components @kind logic */
import { checkOfficialRom, checkPatchedRom } from '@rotp/roms';
import type { RomKind } from '@rotp/roms';
import type { RomCheck, RomCheckMode } from './rom-check.type';

const verifyRomFile = async (file: File, mode: RomCheckMode, expected?: RomKind): Promise<RomCheck> => {
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const verdict = mode === 'patched' ? await checkPatchedRom(file.name, bytes) : await checkOfficialRom(file.name, bytes, expected);
    return { ...verdict, file };
  } catch (error) {
    return { ok: false, message: `The file could not be read: ${error instanceof Error ? error.message : String(error)}`, file };
  }
};

export { verifyRomFile };
