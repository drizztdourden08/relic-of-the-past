/* @layer shared-game @kind logic */
import type { LanguageConfig } from '@rotp/asset-extraction';

const isGlyphName = (name: string, cfg: LanguageConfig): boolean => cfg.alphabet.includes(`[${name}]`);

export { isGlyphName };
