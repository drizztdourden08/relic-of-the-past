/* @layer shared-game @kind logic */
import type { SetBakeInput } from '../../messages';
import { setFromPack } from '../../messages';
import { packFromExtracted } from '../pack';
import type { ExtractedPack } from '../types';

const romSetInput = (pack: ExtractedPack): SetBakeInput => ({
  set: setFromPack(packFromExtracted(pack)),
  fontData: pack.fontData,
  fontWidth: pack.fontWidth,
});

export { romSetInput };
