/* @layer renderer-components @kind logic */
/**
 * How the one variable list is narrowed and labelled.
 *
 * There used to be two tables — a glossary and a name table — and they could not
 * reach each other: a term could not retitle a menu entry, and a menu entry
 * could not appear in a line. One list fixes that, and `kind` is what is left of
 * the distinction: it says where a value comes from, not which table it lives
 * in. So kind is a FILTER here, never a second list.
 *
 * The order is deliberate. Engine-owned variables come first because they are the
 * ones a translator cannot change and needs to recognise on sight; the rest
 * follow in the order the set stores them, which keeps a row where it was found
 * rather than resorting under someone's cursor.
 */
import type { Variable, VariableKind } from '@shared/game/language';

type VariableFilter = 'all' | VariableKind;

/** The word for each kind, as a reader should see it. */
const KIND_WORDS: Record<VariableKind, string> = {
  engine: 'engine',
  term: 'term',
  'menu-name': 'menu name',
};

/** Filter tabs, in the order they are offered. */
const FILTER_ORDER: readonly VariableFilter[] = ['all', 'engine', 'term', 'menu-name'];

const FILTER_WORDS: Record<VariableFilter, string> = {
  all: 'All',
  engine: 'Engine',
  term: 'Terms',
  'menu-name': 'Menu names',
};

/** Engine first, then the set's own order. */
const orderVariables = (variables: Variable[]): Variable[] => [
  ...variables.filter((variable) => variable.kind === 'engine'),
  ...variables.filter((variable) => variable.kind !== 'engine'),
];

const matchesQuery = (variable: Variable, needle: string): boolean => (
  variable.key.toLowerCase().includes(needle)
  || variable.label.toLowerCase().includes(needle)
  || (variable.value ?? '').toLowerCase().includes(needle)
);

/** The rows to show, narrowed by kind and by a free-text query. */
const filterVariables = (
  variables: Variable[],
  filter: VariableFilter,
  query: string,
): Variable[] => {
  const needle = query.trim().toLowerCase();
  return orderVariables(variables).filter((variable) => {
    if (filter !== 'all' && variable.kind !== filter) return false;
    return needle.length === 0 || matchesQuery(variable, needle);
  });
};

/** How many rows each filter would show, for the tab badges. */
const countByFilter = (variables: Variable[]): Record<VariableFilter, number> => ({
  all: variables.length,
  engine: variables.filter((variable) => variable.kind === 'engine').length,
  term: variables.filter((variable) => variable.kind === 'term').length,
  'menu-name': variables.filter((variable) => variable.kind === 'menu-name').length,
});

export { countByFilter, filterVariables, FILTER_ORDER, FILTER_WORDS, KIND_WORDS };
export type { VariableFilter };
