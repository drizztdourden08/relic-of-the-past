/* @layer shared-game @kind logic */
/**
 * The measurement primitives every layout step is built on: a language's
 * per-glyph advance table, the greedy matcher that turns authored text into
 * glyph indices, and the advance lookup itself.
 *
 * Matching is GREEDY LONGEST-MATCH over the alphabet because that is what the
 * encoder does (`encodeGreedyFromDict` in
 * shared/asset-extraction/text/dialogue-encoder.ts checks the whole bracketed
 * run against its alphabet map before it ever falls through to a single
 * character). Several alphabets carry multi-character entries, such as bracketed
 * pseudo-glyph names for an icon or a button face, and the ellipsis run.
 * Each of those is ONE glyph with ONE advance. Matching a character at a
 * time would score the ellipsis as three separate dots, so a row that the
 * engine draws at one glyph's width would be predicted three times too wide.
 * Longest-match keeps the prediction and the bake in step.
 *
 * The dictionary is deliberately not simulated: every dictionary entry is
 * itself spelled out of alphabet characters, so it expands to the same glyphs
 * at draw time and cannot change a row's width.
 */
import type { LanguageConfig } from '@shared/asset-extraction/text/data/language-data';
import type { GlyphMetrics } from './types';

/**
 * Advance charged to a glyph index the width table has no entry for. The table
 * holds values 1..8, so the widest possible glyph is the safe assumption: a row
 * is then never reported narrower than the engine could draw it.
 */
const FALLBACK_ADVANCE_PX = 8;

/** Where one glyph was found in a string, and how much of it the glyph ate. */
type GlyphMatch = {
  /** Index into the language's alphabet, and into its width table. */
  index: number;
  /** Characters consumed. More than one for a multi-character entry. */
  length: number;
};

/** Alphabet reversed for matching: entry text to index, plus the longest entry. */
type AlphabetLookup = {
  byText: Map<string, number>;
  longest: number;
};

/**
 * Reversal is memoised per metrics object instead of rebuilt per character.
 * The cache is keyed on identity and never observable, so the exported
 * functions stay pure: same metrics in, same result out.
 */
const lookups = new WeakMap<GlyphMetrics, AlphabetLookup>();

const buildLookup = (alphabet: readonly string[]): AlphabetLookup => {
  const byText = new Map<string, number>();
  let longest = 1;

  for (let index = 0; index < alphabet.length; index += 1) {
    const entry = alphabet[index];
    if (entry.length === 0) continue;
    // Ascending, overwriting: a few alphabets list the same character twice and
    // the encoder's own reversal keeps the LAST index. Mirror it exactly.
    byText.set(entry, index);
    if (entry.length > longest) longest = entry.length;
  }

  return { byText, longest };
};

const lookupFor = (metrics: GlyphMetrics): AlphabetLookup => {
  const cached = lookups.get(metrics);
  if (cached !== undefined) return cached;

  const built = buildLookup(metrics.alphabet);
  lookups.set(metrics, built);
  return built;
};

/**
 * Pair a language's alphabet with the raw bytes of its `font-width.bin` (one
 * byte per glyph index, in alphabet order). Both are copied, so a later edit to
 * either source cannot silently change a measurement.
 */
const buildGlyphMetrics = (cfg: LanguageConfig, fontWidth: Uint8Array): GlyphMetrics => ({
  widths: Uint8Array.from(fontWidth),
  alphabet: [...cfg.alphabet],
});

/**
 * The glyph the text starts with at `at`, longest alphabet entry first, or null
 * when nothing in the alphabet matches there.
 */
const glyphIndexOf = (text: string, at: number, metrics: GlyphMetrics): GlyphMatch | null => {
  const { byText, longest } = lookupFor(metrics);
  const most = Math.min(longest, text.length - at);

  for (let length = most; length >= 1; length -= 1) {
    const index = byText.get(text.slice(at, at + length));
    if (index !== undefined) return { index, length };
  }

  return null;
};

/** One glyph's pen advance in pixels. */
const widthOf = (index: number, metrics: GlyphMetrics): number => {
  const advance = metrics.widths[index];
  return advance === undefined ? FALLBACK_ADVANCE_PX : advance;
};

/** Every glyph a string draws, plus the runs of it that draw nothing at all. */
type GlyphRun = {
  glyphs: number[];
  /** Text the alphabet has no glyph for. Reported, never charged a width. */
  unmatched: string[];
};

/**
 * How much to skip past an unmatchable position. A bracketed run is reported
 * whole (`[Unknown]`, not a lone `[`) so the report names something the
 * author can find, the same way `validateEntry` reports it.
 */
const unmatchedAt = (text: string, at: number): string => {
  if (text[at] !== '[') return text[at];
  const closeAt = text.indexOf(']', at);
  return closeAt < 0 ? text[at] : text.slice(at, closeAt + 1);
};

/** Walk a whole string through the matcher, collecting glyphs and misses. */
const matchGlyphs = (text: string, metrics: GlyphMetrics): GlyphRun => {
  const glyphs: number[] = [];
  const unmatched: string[] = [];
  let at = 0;

  while (at < text.length) {
    const match = glyphIndexOf(text, at, metrics);
    if (match !== null) {
      glyphs.push(match.index);
      at += match.length;
      continue;
    }
    const miss = unmatchedAt(text, at);
    unmatched.push(miss);
    at += miss.length;
  }

  return { glyphs, unmatched };
};

export { buildGlyphMetrics, glyphIndexOf, matchGlyphs, widthOf, FALLBACK_ADVANCE_PX };
export type { GlyphMatch, GlyphRun };
