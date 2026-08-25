/* @layer renderer-components @kind logic */
/**
 * The picture characters that are spelled as TWO alphabet entries, and which
 * half a given entry is.
 *
 * A few pictures are too wide for one cell, so the alphabet spells them with a
 * pair of adjacent entries and the engine draws the halves side by side. To an
 * author that is one picture: it is inserted as one thing, it reads as one thing,
 * and it is deleted as one thing. Drawing the halves as two separate objects gave
 * a caret position in the middle of a picture that the browser could not even
 * paint — a zero-width rectangle between two uneditable boxes with no text
 * between them — and a click that could only ever select half of it.
 *
 * The pairs are NOT listed here. The sprite manifest already records them: an
 * extraction recipe that names a second glyph produces one sprite covering both
 * entries, and the derived map marks the two entries `first` and `second` of that
 * one file. Reading that is what keeps the two from drifting apart.
 *
 * Names are the BARE bracket names — `1HeartL`, not `[1HeartL]` — because that is
 * the form a token carries and the form the drawing code asks with. Only the base
 * alphabet's pairs are known; a localized alphabet that splits a picture its own
 * way keeps its own entry names, resolves to nothing here, and simply draws as
 * two cells the way it did before.
 */
import { PICTURE_GLYPH_SPRITES } from '@shared/game/data/sprite-manifest/picture-glyph-sprites';

/** `[1HeartL]` as the alphabet stores it, `1HeartL` as a token carries it. */
const bareName = (token: string): string => token.replace(/^\[|\]$/g, '');

/** First half → second half, for every picture the manifest spells as a pair. */
const buildPairs = (): Map<string, string> => {
  const firstOf = new Map<string, string>();
  const secondOf = new Map<string, string>();

  for (const [token, sprite] of Object.entries(PICTURE_GLYPH_SPRITES)) {
    if (sprite.span === 'first') firstOf.set(sprite.file, bareName(token));
    if (sprite.span === 'second') secondOf.set(sprite.file, bareName(token));
  }

  const pairs = new Map<string, string>();
  for (const [file, first] of firstOf) {
    const second = secondOf.get(file);
    if (second !== undefined) pairs.set(first, second);
  }
  return pairs;
};

const PAIRS = buildPairs();
const SECOND_HALVES = new Set<string>(PAIRS.values());

/** The name of `name`'s other half, when `name` opens a two-entry picture. */
const mergedSecondOf = (name: string): string | null => PAIRS.get(name) ?? null;

/** True when `name` closes a two-entry picture, so it draws nothing of its own. */
const isMergedSecond = (name: string): boolean => SECOND_HALVES.has(name);

export { isMergedSecond, mergedSecondOf };
