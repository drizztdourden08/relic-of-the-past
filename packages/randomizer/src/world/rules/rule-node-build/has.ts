/* @layer shared-game @kind logic */
import type { Holding } from '../../collection-state.type';
import type { RuleNode } from '../rule-node.type';

const has = (item: Holding, count = 1): RuleNode =>
  (count === 1 ? { op: 'has', item } : { op: 'has', item, count });

export { has };
