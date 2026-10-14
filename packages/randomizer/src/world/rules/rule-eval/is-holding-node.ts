/* @layer shared-game @kind logic */
import type { RuleNode } from '../rule-node.type';
import { HOLDING_OPS } from './rule-op-groups.constants';
import type { HoldingNode } from './rule-op-groups.type';

const isHoldingNode = (node: RuleNode): node is HoldingNode => HOLDING_OPS.has(node.op);

export { isHoldingNode };
