/* @layer renderer-components @kind logic */
import type { Variable } from '@shared/game/language';
import type { VariableFilter } from '../variables.type';

const engineFirstThenStoredOrder = (variables: Variable[]): Variable[] => [
  ...variables.filter((variable) => variable.kind === 'engine'),
  ...variables.filter((variable) => variable.kind !== 'engine'),
];

const matchesQuery = (variable: Variable, needle: string): boolean => (
  variable.key.toLowerCase().includes(needle)
  || variable.label.toLowerCase().includes(needle)
  || (variable.value ?? '').toLowerCase().includes(needle)
);

const filterVariables = (
  variables: Variable[],
  filter: VariableFilter,
  query: string,
): Variable[] => {
  const needle = query.trim().toLowerCase();
  return engineFirstThenStoredOrder(variables).filter((variable) => {
    if (filter !== 'all' && variable.kind !== filter) return false;
    return needle.length === 0 || matchesQuery(variable, needle);
  });
};

export { filterVariables };
