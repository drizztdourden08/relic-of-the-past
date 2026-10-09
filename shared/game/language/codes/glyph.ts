/* @layer shared-game @kind logic */
import type { LanguageConfig } from '@rotp/game-data';

const isGlyphName = (name: string, cfg: LanguageConfig): boolean => cfg.alphabet.includes(`[${name}]`);

export { isGlyphName };
