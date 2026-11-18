/* @layer renderer-components @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Text } from '@drizztdourden08/brock-core/i18n';
import { checkOfficialRom, checkPatchedRom } from '@rotp/roms';
import type { RomKind } from '@rotp/roms';
import type { RomCheck, RomCheckMode } from './rom-check.type';

const verifyRomFile = async (
  file: File, mode: RomCheckMode, expected: RomKind | undefined, text: (text: Text) => string,
): Promise<RomCheck> => {
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const verdict = mode === 'patched' ? await checkPatchedRom(file.name, bytes) : await checkOfficialRom(file.name, bytes, expected);
    return { ok: verdict.ok, message: text(verdict.message), file };
  } catch (error) {
    return { ok: false, message: text(msg('data-manager:rom-check.unreadable', { reason: error instanceof Error ? error.message : String(error) })), file };
  }
};

export { verifyRomFile };
