/* @layer shared-game @kind types */
import type { RuleNode } from '../../world/rules/rule-node.type';

type PassThroughOp = 'true' | 'false' | 'hasAny' | 'region' | 'location' | 'exit' | 'placedAt';

type PassThroughNode = Extract<RuleNode, { op: PassThroughOp }>;

type IfNode = Extract<RuleNode, { op: 'if' }>;

type ReadingNode = Exclude<RuleNode, PassThroughNode | IfNode | { op: 'all' | 'any' | 'helper' }>;

type Again = (child: RuleNode) => RuleNode;

export type { Again, IfNode, PassThroughNode, PassThroughOp, ReadingNode };
