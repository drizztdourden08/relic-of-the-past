/* @layer renderer-components @kind logic */
/**
 * Which rows the drag ghost carries: the first few of the rendered order,
 * skipping collapsed branches. It deliberately does not follow the scroll
 * position, which would re-render every header per wheel tick. The walk stops
 * at the cap, so the cost is the cap, not the table.
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
