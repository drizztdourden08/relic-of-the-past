/* @layer shared-game @kind logic */
import type { Variable, VariableIndex } from './types';

const buildVariableIndex = (variables: Variable[]): VariableIndex => {
  const index: VariableIndex = new Map();
  for (const variable of variables) {
    if (!index.has(variable.key)) index.set(variable.key, variable);
  }
  return index;
};

export { buildVariableIndex };
