/* @layer shared-asset-extraction @kind logic */
import { createHash } from 'crypto';
import type { RomData } from '../rom-types';
import { createRomData } from './create-rom-data';
import { SMC_HEADER_BYTES, SWEDISH_DOUBLE_HEADER_LENGTH, ZELDA3_SHA1 } from './rom-loader.constants';

const stripSmcHeader = (bytes: Buffer): Buffer =>
  (bytes.length & 0xfffff) === SMC_HEADER_BYTES ? bytes.subarray(SMC_HEADER_BYTES) : bytes;

const loadRomFromBuffer = (buffer: Buffer, supportMultilanguage = false): RomData => {
  let romBytes = stripSmcHeader(buffer);

  const hash = createHash('sha1').update(romBytes).digest('hex').toUpperCase();
  const entry = ZELDA3_SHA1[hash];

  if (entry?.language === 'sv' && romBytes.length === SWEDISH_DOUBLE_HEADER_LENGTH) {
    romBytes = romBytes.subarray(SMC_HEADER_BYTES);
  }

  if (!entry) {
    throw new Error(supportMultilanguage
      ? `This is not a known release of A Link to the Past (SHA-1 ${hash}).`
      : `ROM with hash ${hash} not supported. Expected US ROM.`);
  }
  if (!supportMultilanguage && entry.language !== 'us') {
    throw new Error(`ROM with hash ${hash} not supported. Expected US ROM.`);
  }

  return createRomData(romBytes, entry.language, entry.description);
};

export { loadRomFromBuffer };
