/* @layer shared-game @kind types */
import type { RuleNode } from '../rule-node.type';

type HoldingOp = 'has' | 'hasAny' | 'hasDistinct' | 'countGroup';

type CombinatorOp = 'all' | 'any' | 'if';

type WorldQueryOp = 'region' | 'location' | 'exit' | 'placedAt' | 'option' | 'seed';

type HoldingNode = Extract<RuleNode, { op: HoldingOp }>;

type CombinatorNode = Extract<RuleNode, { op: CombinatorOp }>;

type WorldQueryNode = Extract<RuleNode, { op: WorldQueryOp }>;

type ConstantNode = Extract<RuleNode, { op: 'true' | 'false' }>;

export type { CombinatorNode, CombinatorOp, ConstantNode, HoldingNode, HoldingOp, WorldQueryNode, WorldQueryOp };
