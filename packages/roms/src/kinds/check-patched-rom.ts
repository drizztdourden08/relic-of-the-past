/* @layer shared-storage @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import {
  DOUBLE_HEADER_LENGTH, PATCHED_ROM_MAX_BYTES, PATCHED_ROM_MIN_BYTES, SMC_HEADER_BYTES, stripSmcHeader,
} from '@rotp/asset-extraction';
import { MEGABYTE } from './check-patched-rom.constants';
import { romBodyOf } from './rom-body-of';
import { sha1Hex } from './sha1-hex';
import type { RomVerdict } from './rom-verdict.type';

const checkPatchedRom = async (fileName: string, bytes: Uint8Array): Promise<RomVerdict> => {
  const body = await romBodyOf(fileName, bytes);
  if (body === 'archive') return { ok: true, message: msg('roms:verdict.archive') };
  if (body === null) return { ok: false, message: msg('roms:verdict.archive-empty') };
  const stripped = stripSmcHeader(body);
  const rom = stripped.length === DOUBLE_HEADER_LENGTH ? stripped.subarray(SMC_HEADER_BYTES) : stripped;
  if (rom.length < PATCHED_ROM_MIN_BYTES || rom.length > PATCHED_ROM_MAX_BYTES) {
    return { ok: false, message: msg('roms:verdict.patched-bad-size', { bytes: rom.length }) };
  }
  const hash = await sha1Hex(rom);
  return { ok: true, message: msg('roms:verdict.patched-ok', { size: (rom.length / MEGABYTE).toFixed(1), hash: hash.slice(0, 8) }) };
};

export { checkPatchedRom };
