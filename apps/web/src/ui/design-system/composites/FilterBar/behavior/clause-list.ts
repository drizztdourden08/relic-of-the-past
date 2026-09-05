/* @layer renderer-components @kind logic */
/** Pure clause-list transitions keyed by clause id, never array index, so a stale index can never touch the wrong row. */
import type { FilterClause } from '../../../data/filter/clause';

const addClause = (
  clauses: readonly FilterClause[],
  clause: FilterClause,
): readonly FilterClause[] => [...clauses, clause];

const removeClause = (
  clauses: readonly FilterClause[],
  id: string,
): readonly FilterClause[] => clauses.filter((clause) => clause.id !== id);

const updateClauseById = (
  clauses: readonly FilterClause[],
  id: string,
  patch: Partial<FilterClause>,
): readonly FilterClause[] =>
  clauses.map((clause) => (clause.id === id ? { ...clause, ...patch } : clause));

export { addClause, removeClause, updateClauseById };
