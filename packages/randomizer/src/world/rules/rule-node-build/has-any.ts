/* @layer shared-game @kind logic */
import type { Holding } from '../../collection-state.type';
import type { RuleNode } from '../rule-node.type';

const hasAny = (items: readonly Holding[]): RuleNode => ({ op: 'hasAny', items });

export { hasAny };
