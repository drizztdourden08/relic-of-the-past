/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../../rom/rom-types';
import { readByteRegion } from '../read-byte-region';
import { readWordRegion } from '../read-word-region';
import type { ScreenAddressTable } from '../screen-payload.type';
import { convertWordCredits } from './convert-word-credits';
import { convertWordEnding } from './convert-word-ending';
import { createWordIndexer } from './create-word-indexer';
import type { EndText } from './end-text.type';

const extractEndText = (rom: RomData, table: ScreenAddressTable): EndText => {
  const { credits, endingCaptions } = table;
  if (credits.kind === 'bytes' && endingCaptions.kind === 'bytes') {
    return {
      credits: {
        text: readByteRegion(rom, credits.text),
        offsets: readWordRegion(rom, credits.offsets),
        map: readWordRegion(rom, credits.map),
      },
      endingCaptions: {
        offsets: readWordRegion(rom, endingCaptions.offsets),
        data: readByteRegion(rom, endingCaptions.data),
      },
    };
  }
  if (credits.kind !== 'words' || endingCaptions.kind !== 'words') {
    throw new Error(`${table.id}: credits and ending captions must share one storage form`);
  }
  const indexer = createWordIndexer();
  const converted = convertWordCredits(rom, credits, indexer);
  const ending = convertWordEnding(rom, endingCaptions, indexer);
  return { credits: { ...converted, map: indexer.toMap() }, endingCaptions: ending };
};

export { extractEndText };
