/* @layer renderer-components @kind logic */
/**
 * Pure add/remove/update transitions over a clause list, keyed by the clause's
 * own id — never by array index, so a clause survives reordering and a stale
 * index captured before a re-render can never touch the wrong row. Extracted
 * out of FilterBar so the transitions are unit-tested without rendering
 * anything (see filter-bar-clause-list.test.ts).
 */
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
