/* @layer shared-asset-extraction @kind logic */
import { createHash } from 'crypto';
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { RomData } from '../rom-types';
import { createRomData } from './create-rom-data';
import { fanTranslationRefusal } from './fan-translation-refusal';
import { GAME_ROM_LANGUAGE, ZELDA3_SHA1 } from './rom-loader.constants';
import { RomLoadError } from './rom-load-error';
import { stripSmcHeader } from './strip-smc-header';

const usRomRequired = (hash: string): RomLoadError => new RomLoadError(
  msg('rom-loader:error.usRomRequired', { hash }),
  `ROM with hash ${hash} not supported. Expected US ROM.`,
);

const unknownRelease = (hash: string): RomLoadError => new RomLoadError(
  msg('rom-loader:error.unknownRelease', { hash }),
  `This is not a known release of A Link to the Past (SHA-1 ${hash}).`,
);

const loadRomFromBuffer = (buffer: Buffer, supportMultilanguage = false): RomData => {
  const romBytes = stripSmcHeader(buffer);

  const hash = createHash('sha1').update(romBytes).digest('hex').toUpperCase();
  const entry = ZELDA3_SHA1[hash];

  if (!entry) {
    const fan = fanTranslationRefusal(hash);
    if (fan !== null) throw fan;
    throw supportMultilanguage ? unknownRelease(hash) : usRomRequired(hash);
  }
  if (!supportMultilanguage && entry.language !== GAME_ROM_LANGUAGE) throw usRomRequired(hash);

  return createRomData(romBytes, entry.language, entry.revision, entry.description);
};

export { loadRomFromBuffer };
