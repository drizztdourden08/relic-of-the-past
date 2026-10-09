/* @layer shared-game @kind logic */
import type { Holding } from '../../collection-state.type';
import type { RuleCount, RuleNode } from '../rule-node.type';

const hasDistinct = (items: readonly Holding[], atLeast: RuleCount): RuleNode =>
  ({ op: 'hasDistinct', items, atLeast });

export { hasDistinct };
