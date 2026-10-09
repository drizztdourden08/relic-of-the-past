/* @layer shared-game @kind logic */
import type { Holding } from '../../collection-state.type';
import type { RuleCount, RuleNode } from '../rule-node.type';

const countGroup = (items: readonly Holding[], atLeast: RuleCount): RuleNode =>
  ({ op: 'countGroup', items, atLeast });

export { countGroup };
