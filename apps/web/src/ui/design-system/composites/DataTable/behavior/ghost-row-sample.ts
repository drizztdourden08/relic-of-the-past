/* @layer renderer-components @kind logic */
/**
 * Which rows the drag ghost carries with the column.
 *
 * The ghost shows a handful of real values, not the whole column — a table of
 * nine hundred records would otherwise build nine hundred offscreen cells per
 * header, every render, for an image the size of a business card. The cap is
 * the point of this file; the walk below merely picks WHICH ones.
 *
 * It takes them off the TOP of the rendered order, which is the order the rows
 * are actually in and the run sitting right under the sticky header. Collapsed
 * branches are skipped, so a sample never contains a row nobody can see. What
 * it deliberately does NOT do is follow the scroll position: that would mean
 * measuring the scroller and re-rendering every header on every wheel tick, to
 * change values in an image that is only ever a few rows tall anyway.
 *
 * The walk stops as soon as the cap is met, so the cost is the cap, not the
 * table.
 */
import { groupUid } from './group-uid';
import type { GroupedRow } from '../../../data/table/types';

interface GhostRowSample<T> {
  nodes: readonly GroupedRow<T>[];
  /** The same predicate the row tree renders by, so the two agree on "shown". */
  isExpanded: (uid: string) => boolean;
  limit: number;
}

const collect = <T>(sample: GhostRowSample<T>, parentUid: string, into: T[]): void => {
  const { nodes, isExpanded, limit } = sample;
  for (const node of nodes) {
    if (into.length >= limit) return;
    if (node.kind === 'row') {
      into.push(node.row);
      continue;
    }
    const uid = groupUid(parentUid, node.path, node.key);
    if (isExpanded(uid)) collect({ nodes: node.children, isExpanded, limit }, uid, into);
  }
};

/** The first `limit` rows of the rendered order, or fewer if that is all there is. */
const ghostRowSample = <T>(sample: GhostRowSample<T>): readonly T[] => {
  const picked: T[] = [];
  if (sample.limit > 0) collect(sample, '', picked);
  return picked;
};

export { ghostRowSample };
export type { GhostRowSample };
