/* @layer shared-storage @kind logic */
import type { LanguagePack } from '@rotp/asset-extraction';
import { parseDialogueText } from '@rotp/asset-extraction';
import type { ExtractedPack } from '../types';
import { metaFromExtracted } from './meta-from-extracted';

const packFromExtracted = (pack: ExtractedPack): LanguagePack => ({
  meta: metaFromExtracted(pack),
  lines: parseDialogueText(pack.dialogue),
  font: { tiles: Array.from(pack.fontData), glyphCount: pack.glyphCount },
});

export { packFromExtracted };
