/* @layer shared-game @kind logic */
/**
 * Tells a bracketed pseudo-glyph character (a button icon, an arrow, `...`)
 * apart from a real control code. Both are spelled identically, as a bare
 * `[Name]` bracket run, and `parseTokens` deliberately classifies both as
 * paramless `cmd` tokens for round-trip safety (see its header comment in
 * `tokens/parse-tokens.ts`). This is the presentation-layer follow-up it
 * points to: look the bracket's name up in the language's own `alphabet`,
 * where every glyph is listed with its brackets intact (e.g. `'[A]'`).
 */
import type { LanguageConfig } from '@shared/asset-extraction/text/data/language-data';

const isGlyphName = (name: string, cfg: LanguageConfig): boolean => cfg.alphabet.includes(`[${name}]`);

export { isGlyphName };
