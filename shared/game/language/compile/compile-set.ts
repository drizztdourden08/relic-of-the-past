/* @layer shared-game @kind logic */
/**
 * Bake step. Turns an editable LanguageSet into the packed entry the asset
 * blob builder consumes. Resolves every variable reference, serializes the
 * token streams back to the bracket-string format the compression path
 * expects, then delegates the actual packing to
 * shared/asset-extraction's `buildPackedEntry`, which runs the same dictionary
 * and compression logic a ROM-extracted language goes through.
 *
 * The compiled entry's language CODE is the SET's id, not its base: `id` is
 * what `kDialogueMap` carries and what the INI `Language` key selects at
 * boot, while `base` only supplies the alphabet/dictionary/encoder this set
 * inherits. `buildPackedEntry` is called with the base code so encoding uses
 * the right config, then the result's `code` is overridden to the set's own
 * id. Encoding, dictionary and flags stay derived from the base language.
 *
 * Pure function: no file or ROM I/O.
 */
import type { PackedLangEntry } from '@shared/asset-extraction/text/build-language-entry';
import { buildPackedEntry } from '@shared/asset-extraction/text/build-language-entry';
import { kLanguages } from '@shared/asset-extraction/text/data/language-data';
import type { LanguageSet } from '../types';
import { buildVariableIndex } from '../variables/variable-index';
import { resolve } from '../variables/resolve';
import { variablesFromLegacy } from '../variables/from-legacy';
import { serializeTokens } from '../tokens/serialize-tokens';

/**
 * Bake mode: a variable the game owns keeps its raw code, everything of ours
 * expands to literal text. The preview runs the same resolution with sample
 * values, which is what stops the two from drifting apart.
 */
const BAKE = { mode: 'bake' } as const;

/** Canonical dialogue line count every compiled entry must match. */
const EXPECTED_LINE_COUNT = 397;

/**
 * A non-zero index tells `buildPackedEntry` this is not the base US ROM
 * entry (its flags bit1 = "no US ROM match"). A compiled set is always
 * assembled as an extra alongside the US entry, never as index 0 itself.
 */
const NON_BASE_INDEX = 1;

/**
 * Persisted font bytes a language set carries alongside its dialogue. The
 * same pair `buildPackedEntry` expects from a ROM extraction: the raw 2bpp
 * glyph sheet and its per-glyph width table.
 */
type SetFont = {
  fontData: Buffer;
  fontWidth: Buffer;
};

/** Sort dialogue entries by id and verify they form a contiguous 1..N run. */
const orderedDialogue = (set: LanguageSet): LanguageSet['dialogue'] => {
  const sorted = [...set.dialogue].sort((a, b) => a.id - b.id);

  if (sorted.length !== EXPECTED_LINE_COUNT) {
    throw new Error(
      `compileSet: expected ${EXPECTED_LINE_COUNT} dialogue entries for set "${set.id}", `
      + `got ${sorted.length}`,
    );
  }

  sorted.forEach((entry, i) => {
    if (entry.id !== i + 1) {
      throw new Error(
        `compileSet: dialogue entries for set "${set.id}" must form a contiguous `
        + `1..${EXPECTED_LINE_COUNT} sequence; found id ${entry.id} at position ${i + 1}`,
      );
    }
  });

  return sorted;
};

const compileSet = (set: LanguageSet, font: SetFont): PackedLangEntry => {
  const cfg = kLanguages[set.base];
  if (!cfg) throw new Error(`compileSet: unknown base language "${set.base}" for set "${set.id}"`);

  // A set read through storage carries `variables`; one built in memory may not,
  // so fall back to projecting the legacy pair instead of refusing to compile.
  const vars = buildVariableIndex(set.variables ?? variablesFromLegacy(set.glossary, set.names));

  const texts = orderedDialogue(set)
    .map((entry) => serializeTokens(resolve(entry.tokens, vars, BAKE)));

  const packed = buildPackedEntry({
    code: set.base,
    texts,
    fontData: font.fontData,
    fontWidth: font.fontWidth,
    index: NON_BASE_INDEX,
  });

  return { ...packed, code: set.id };
};

export { compileSet };
export type { SetFont };
