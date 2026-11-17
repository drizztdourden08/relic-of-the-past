/* @layer shared-game @kind logic */
import type { LanguageSet } from '../types';
import { buildVariableIndex } from '../variables/variable-index';
import { resolve } from '../variables/resolve';
import { variablesFromNameTables } from '../variables/variables-from-name-tables';
import { serializeTokens } from '../tokens/serialize-tokens';
import { BAKE, EXPECTED_LINE_COUNT } from './compile.constants';

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

const bakedTexts = (set: LanguageSet): string[] => {
  const vars = buildVariableIndex(set.variables ?? variablesFromNameTables(set.glossary, set.names));
  return orderedDialogue(set).map((entry) => serializeTokens(resolve(entry.tokens, vars, BAKE)));
};

export { bakedTexts };
