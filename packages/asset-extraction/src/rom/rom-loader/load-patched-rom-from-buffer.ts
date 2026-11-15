/* @layer shared-asset-extraction @kind logic */
import type { RomData, RomLanguage } from '../rom-types';
import { createRomData } from './create-rom-data';
import {
  PATCHED_ROM_MAX_BYTES, PATCHED_ROM_MIN_BYTES, SMC_HEADER_BYTES, SWEDISH_DOUBLE_HEADER_LENGTH, ZELDA3_SHA1,
} from './rom-loader.constants';
import { stripSmcHeader } from './strip-smc-header';

const releaseDescription = (base: RomLanguage): string => {
  const entry = Object.values(ZELDA3_SHA1).find((candidate) => candidate.language === base);
  if (!entry) throw new Error(`"${base}" is not a known release of A Link to the Past.`);
  return entry.description;
};

const loadPatchedRomFromBuffer = (buffer: Buffer, base: RomLanguage): RomData => {
  const description = releaseDescription(base);
  let romBytes = stripSmcHeader(buffer);
  if (base === 'sv' && romBytes.length === SWEDISH_DOUBLE_HEADER_LENGTH) {
    romBytes = romBytes.subarray(SMC_HEADER_BYTES);
  }
  if (romBytes.length < PATCHED_ROM_MIN_BYTES || romBytes.length > PATCHED_ROM_MAX_BYTES) {
    throw new Error(`This file is ${romBytes.length} bytes, which is not the size of an A Link to the Past ROM.`);
  }
  return createRomData(romBytes, base, `Fan patch of ${description}`);
};

export { loadPatchedRomFromBuffer };
