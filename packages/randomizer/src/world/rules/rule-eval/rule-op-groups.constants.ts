/* @layer shared-game @kind constants */
import type { RuleNode } from '../rule-node.type';
import type { CombinatorOp, HoldingOp, WorldQueryOp } from './rule-op-groups.type';

const HOLDING_OPS: ReadonlySet<RuleNode['op']> = new Set<HoldingOp>(['has', 'hasAny', 'hasDistinct', 'countGroup']);

const COMBINATOR_OPS: ReadonlySet<RuleNode['op']> = new Set<CombinatorOp>(['all', 'any', 'if']);

const WORLD_QUERY_OPS: ReadonlySet<RuleNode['op']> = new Set<WorldQueryOp>([
  'region', 'location', 'exit', 'placedAt', 'option', 'seed',
]);

export { COMBINATOR_OPS, HOLDING_OPS, WORLD_QUERY_OPS };
