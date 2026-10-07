/* @layer renderer-components @kind logic */
/**
 * Layered grouping: a flat row list plus an ordered groupBy becomes a nested
 * tree of group nodes with row leaves.
 *
 * Nested instead of pre-flattened, because a renderer that owns collapse state
 * wants the subtree in hand; flattening a collapsed branch away is trivial from
 * a tree, while rebuilding a tree from a flat list is not.
 *
 * Group order is first-seen: rows arrive already sorted, so the groups come out
 * in the order the sort put them.
 */
import type { GroupedRow } from './types';

type GroupKeyFor<T> = (path: string, row: T) => string;

const asLeaves = <T>(rows: readonly T[]): GroupedRow<T>[] =>
  rows.map((row) => ({ kind: 'row', row }));

const bucketBy = <T>(rows: readonly T[], path: string, groupKeyFor: GroupKeyFor<T>): Map<string, T[]> => {
  const buckets = new Map<string, T[]>();
  for (const row of rows) {
    const key = groupKeyFor(path, row);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(row);
    else buckets.set(key, [row]);
  }
  return buckets;
};

const build = <T>(
  rows: readonly T[],
  groupBy: readonly string[],
  groupKeyFor: GroupKeyFor<T>,
  level: number,
): GroupedRow<T>[] => {
  const path = groupBy[level];
  if (path === undefined) return asLeaves(rows);
  const buckets = bucketBy(rows, path, groupKeyFor);
  return [...buckets].map(([key, bucket]) => ({
    kind: 'group',
    level,
    key,
    path,
    count: bucket.length,
    children: build(bucket, groupBy, groupKeyFor, level + 1),
  }));
};

const groupRows = <T>(
  rows: readonly T[],
  groupBy: readonly string[],
  groupKeyFor: GroupKeyFor<T>,
): GroupedRow<T>[] => build(rows, groupBy, groupKeyFor, 0);

/** Depth-first walk that yields only the row leaves, in render order. */
const flattenGroups = <T>(grouped: readonly GroupedRow<T>[]): readonly T[] =>
  grouped.flatMap((node) => (node.kind === 'row' ? [node.row] : flattenGroups(node.children)));

export { flattenGroups, groupRows };
export type { GroupKeyFor };
