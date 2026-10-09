/* @layer shared-game @kind logic */
import type { LanguageConfig } from '@shared/asset-extraction/text/data/language-data';

const isGlyphName = (name: string, cfg: LanguageConfig): boolean => cfg.alphabet.includes(`[${name}]`);

export { isGlyphName };
