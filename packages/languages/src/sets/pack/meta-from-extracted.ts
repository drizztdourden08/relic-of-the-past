/* @layer shared-storage @kind logic */
import type { LanguageMeta } from '@rotp/asset-extraction';
import type { ExtractedPayload } from '../types';

const metaFromExtracted = (pack: ExtractedPayload): LanguageMeta => ({
  code: pack.code, glyphCount: pack.glyphCount, lineCount: pack.lineCount,
  encoder: pack.encoder, flags: pack.flags, source: pack.description,
});

export { metaFromExtracted };
