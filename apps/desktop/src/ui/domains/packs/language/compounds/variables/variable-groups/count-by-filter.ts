/* @layer renderer-components @kind logic */
import type { Variable } from '@rotp/languages';
import type { VariableFilter } from '../variables.type';

const countByFilter = (variables: Variable[]): Record<VariableFilter, number> => ({
  all: variables.length,
  engine: variables.filter((variable) => variable.kind === 'engine').length,
  term: variables.filter((variable) => variable.kind === 'term').length,
  'menu-name': variables.filter((variable) => variable.kind === 'menu-name').length,
});

export { countByFilter };
