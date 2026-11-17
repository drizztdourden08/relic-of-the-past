/* @layer shared-asset-extraction @kind logic */
import { createHash } from 'crypto';
import type { RomData } from '../rom-types';
import { createRomData } from './create-rom-data';
import { fanTranslationRefusal } from './fan-translation-refusal';
import { GAME_ROM_LANGUAGE, ZELDA3_SHA1 } from './rom-loader.constants';
import { stripSmcHeader } from './strip-smc-header';

const loadRomFromBuffer = (buffer: Buffer, supportMultilanguage = false): RomData => {
  const romBytes = stripSmcHeader(buffer);

  const hash = createHash('sha1').update(romBytes).digest('hex').toUpperCase();
  const entry = ZELDA3_SHA1[hash];

  if (!entry) {
    const fan = fanTranslationRefusal(hash);
    if (fan !== null) throw new Error(fan);
    throw new Error(supportMultilanguage
      ? `This is not a known release of A Link to the Past (SHA-1 ${hash}).`
      : `ROM with hash ${hash} not supported. Expected US ROM.`);
  }
  if (!supportMultilanguage && entry.language !== GAME_ROM_LANGUAGE) {
    throw new Error(`ROM with hash ${hash} not supported. Expected US ROM.`);
  }

  return createRomData(romBytes, entry.language, entry.revision, entry.description);
};

export { loadRomFromBuffer };
