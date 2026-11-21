/* @layer shared-storage @kind logic */
import type { LanguagePack } from '@rotp/asset-extraction';
import { parseDialogueText } from '@rotp/asset-extraction';
import type { ExtractedPayload } from '../types';
import { metaFromExtracted } from './meta-from-extracted';

const packFromExtracted = (pack: ExtractedPayload): LanguagePack => ({
  meta: metaFromExtracted(pack),
  lines: parseDialogueText(pack.dialogue),
});

export { packFromExtracted };
