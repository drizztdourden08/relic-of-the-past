/* @layer shared-game @kind logic */
import type { RuleNode } from '../rule-node.type';
import { COMBINATOR_OPS } from './rule-op-groups.constants';
import type { CombinatorNode } from './rule-op-groups.type';

const isCombinatorNode = (node: RuleNode): node is CombinatorNode => COMBINATOR_OPS.has(node.op);

export { isCombinatorNode };
