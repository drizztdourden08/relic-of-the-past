/* @layer shared-game @kind logic */
import type { PackedLangEntry } from '@rotp/asset-extraction';
import { buildPackedEntry } from '@rotp/asset-extraction';
import { kLanguages } from '@rotp/asset-extraction';
import type { LanguageSet } from '../types';
import { buildVariableIndex } from '../variables/variable-index';
import { resolve } from '../variables/resolve';
import { variablesFromNameTables } from '../variables/variables-from-name-tables';
import { serializeTokens } from '../tokens/serialize-tokens';
import type { SetFont } from './compile.type';
import { BAKE, EXPECTED_LINE_COUNT, NON_BASE_INDEX } from './compile.constants';

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

  const vars = buildVariableIndex(set.variables ?? variablesFromNameTables(set.glossary, set.names));

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
