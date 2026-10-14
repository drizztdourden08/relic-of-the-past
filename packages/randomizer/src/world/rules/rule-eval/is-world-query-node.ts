/* @layer shared-game @kind logic */
import type { RuleNode } from '../rule-node.type';
import { WORLD_QUERY_OPS } from './rule-op-groups.constants';
import type { WorldQueryNode } from './rule-op-groups.type';

const isWorldQueryNode = (node: RuleNode): node is WorldQueryNode => WORLD_QUERY_OPS.has(node.op);

export { isWorldQueryNode };
