/* @layer shared-game @kind logic */
import type { LanguageConfig } from '@shared/asset-extraction/text/data/language-data';
import type { GlyphMetrics } from '../types';

const buildGlyphMetrics = (cfg: LanguageConfig, fontWidth: Uint8Array): GlyphMetrics => ({
  widths: Uint8Array.from(fontWidth),
  alphabet: [...cfg.alphabet],
});

export { buildGlyphMetrics };
