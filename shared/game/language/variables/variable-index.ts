/* @layer shared-game @kind logic */
/**
 * A key lookup over a variable list, built once per expansion pass.
 *
 * FIRST WINS on a duplicate key. `variablesFromLegacy` emits the engine's two
 * entries ahead of everything else, so a locked entry can never be shadowed by
 * a term that happens to share its key. The game owns those two, and a set
 * cannot redefine them.
 */
import type { Variable, VariableIndex } from './types';

const buildVariableIndex = (variables: Variable[]): VariableIndex => {
  const index: VariableIndex = new Map();
  for (const variable of variables) {
    if (!index.has(variable.key)) index.set(variable.key, variable);
  }
  return index;
};

export { buildVariableIndex };
