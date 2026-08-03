/* @layer renderer-components @kind logic */
/**
 * Pure multi-sort transforms plus the row sort itself.
 *
 * The two entry points are deliberately different: a header click REPLACES the
 * whole sort list (cycling asc → desc → none), while the column menu names ONE
 * direction and ADDS a level for it. That is what makes multi-column sort
 * explicit instead of relying on an undiscoverable modifier key.
 */
import type { SortEntry } from './types';

const findSort = (sort: readonly SortEntry[], path: string): SortEntry | undefined =>
  sort.find((entry) => entry.path === path);

/** asc → desc → none, on a list that holds this column and nothing else. */
const setSingleSort = (sort: readonly SortEntry[], path: string): readonly SortEntry[] => {
  const current = sort.length === 1 ? findSort(sort, path) : undefined;
  if (!current) return [{ path, dir: 'asc' }];
  return current.dir === 'asc' ? [{ path, dir: 'desc' }] : [];
};

/**
 * Sets a column to ONE named direction: appends a level when the column is not
 * sorted yet, and rewrites the direction in place — keeping its rank — when it
 * is. Unlike `appendSort` this never flips, because the caller has already said
 * which way it wants; that is what lets a menu offer "ascending" and
 * "descending" as two separate choices rather than one toggle.
 */
const setSortDir = (
  sort: readonly SortEntry[],
  path: string,
  dir: SortEntry['dir'],
): readonly SortEntry[] => {
  if (!findSort(sort, path)) return [...sort, { path, dir }];
  return sort.map((entry) => (entry.path === path ? { path, dir } : entry));
};

const removeSort = (sort: readonly SortEntry[], path: string): readonly SortEntry[] =>
  sort.filter((entry) => entry.path !== path);

type ValueCompare = (path: string, a: unknown, b: unknown) => number;

/** Stable: equal rows keep their incoming order, which keeps grouping predictable. */
const sortRows = <T>(
  rows: readonly T[],
  sort: readonly SortEntry[],
  compare: ValueCompare,
  valueAt: (path: string, row: T) => unknown,
): readonly T[] => {
  if (!sort.length) return rows;
  return [...rows]
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      for (const entry of sort) {
        const result = compare(entry.path, valueAt(entry.path, a.row), valueAt(entry.path, b.row));
        if (result !== 0) return entry.dir === 'asc' ? result : -result;
      }
      return a.index - b.index;
    })
    .map((entry) => entry.row);
};

export { findSort, removeSort, setSingleSort, setSortDir, sortRows };
export type { ValueCompare };
