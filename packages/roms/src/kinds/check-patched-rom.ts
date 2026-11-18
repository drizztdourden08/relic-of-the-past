/* @layer shared-storage @kind logic */
import {
  DOUBLE_HEADER_LENGTH, PATCHED_ROM_MAX_BYTES, PATCHED_ROM_MIN_BYTES, SMC_HEADER_BYTES, stripSmcHeader,
} from '@rotp/asset-extraction';
import { MEGABYTE } from './check-patched-rom.constants';
import { romBodyOf } from './rom-body-of';
import { sha1Hex } from './sha1-hex';
import type { RomVerdict } from './rom-verdict.type';

const checkPatchedRom = async (fileName: string, bytes: Uint8Array): Promise<RomVerdict> => {
  const body = await romBodyOf(fileName, bytes);
  if (body === 'archive') return { ok: true, message: 'Archive, checked when it is imported' };
  if (body === null) return { ok: false, message: 'The archive holds no ROM file.' };
  const stripped = stripSmcHeader(body);
  const rom = stripped.length === DOUBLE_HEADER_LENGTH ? stripped.subarray(SMC_HEADER_BYTES) : stripped;
  if (rom.length < PATCHED_ROM_MIN_BYTES || rom.length > PATCHED_ROM_MAX_BYTES) {
    return { ok: false, message: `This file is ${rom.length} bytes, which is not the size of an A Link to the Past ROM.` };
  }
  const hash = await sha1Hex(rom);
  return { ok: true, message: `A ROM of ${(rom.length / MEGABYTE).toFixed(1)} MB (SHA-1 ${hash.slice(0, 8)})` };
};

export { checkPatchedRom };
