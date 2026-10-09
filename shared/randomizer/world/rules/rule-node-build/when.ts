/* @layer shared-game @kind logic */
import type { RuleNode } from '../rule-node.type';

const when = (cond: RuleNode, then: RuleNode, otherwise: RuleNode): RuleNode =>
  ({ op: 'if', cond, then, else: otherwise });

export { when };
