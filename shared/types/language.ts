/* @layer shared-types @kind logic */
/**
 * Language pack types. The extraction pipeline, the Electron language store, and the
 * renderer's language inspector UI all share them.
 */

interface LanguageMeta {
  /** Language code, e.g. 'fr', 'de', 'fr-c'. */
  code: string;
  /** Number of glyphs in the font's width table (effective alphabet size). */
  glyphCount: number;
  /** Number of dialogue strings. */
  lineCount: number;
  /** Text compression format used by this language. */
  encoder: 'org' | 'new';
  /** Dialogue map flags: bit0 = new format, bit1 = no US ROM match. */
  flags: number;
  /** Human description of the ROM the pack was extracted from. */
  source: string;
}

interface DialogueLine {
  /** 1-based line number as shown in-game tooling. */
  id: number;
  /** Decoded text, including bracketed control tokens (e.g. [Scroll], [Name]). */
  content: string;
}

interface LanguageFont {
  /** Raw 2bpp glyph-sheet bytes (256 tiles x 16 bytes). */
  tiles: number[];
  /** Number of glyphs to display from the sheet. */
  glyphCount: number;
}

/** Full payload for the language inspector UI. */
interface LanguagePack {
  meta: LanguageMeta;
  lines: DialogueLine[];
  font: LanguageFont;
}

/** Summary row for the language list. */
interface LanguageSummary {
  code: string;
  glyphCount: number;
  lineCount: number;
}

export type { LanguageMeta, DialogueLine, LanguageFont, LanguagePack, LanguageSummary };
