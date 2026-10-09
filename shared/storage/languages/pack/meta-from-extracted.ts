/* @layer shared-storage @kind logic */
import type { LanguageMeta } from '@shared/types/language';
import type { ExtractedPack } from '../types';

const metaFromExtracted = (pack: ExtractedPack): LanguageMeta => ({
  code: pack.code, glyphCount: pack.glyphCount, lineCount: pack.lineCount,
  encoder: pack.encoder, flags: pack.flags, source: pack.description,
});

export { metaFromExtracted };
