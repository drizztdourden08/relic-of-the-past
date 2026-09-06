/* @layer renderer-components @kind logic */
/**
 * The free-text half of filtering, compiled the same way clause lists are:
 * FilterBar reports the query as plain state and whoever renders the rows
 * turns it into a predicate here (see clause.ts's `compile` for the clause
 * half). A blank query compiles to null instead of an always-true test, so a
 * caller can skip the row walk entirely when nothing is being searched.
 *
 * The match is deliberately broad: any string, number or boolean anywhere in
 * the row, case-folded, because the search box sits beside structured clause
 * filters that already cover the precise cases. Depth is capped the way the
 * schema walk caps its own recursion, so a cyclic or very deep record cannot
 * hang the filter.
 */
const MAX_TEXT_DEPTH = 4;

const matchesValue = (value: unknown, query: string, depth: number): boolean => {
  if (value == null) return false;
  if (typeof value === 'string') return value.toLowerCase().includes(query);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).includes(query);
  if (depth <= 0) return false;
  if (Array.isArray(value)) return value.some((item) => matchesValue(item, query, depth - 1));
  if (typeof value === 'object') return Object.values(value).some((item) => matchesValue(item, query, depth - 1));
  return false;
};

const compileTextSearch = (query: string): ((row: unknown) => boolean) | null => {
  const folded = query.trim().toLowerCase();
  if (!folded) return null;
  return (row) => matchesValue(row, folded, MAX_TEXT_DEPTH);
};

export { compileTextSearch };
