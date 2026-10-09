/* @layer shared-game @kind logic */
import type { RuleNode } from '../rule-node.type';

const any = (...of: readonly RuleNode[]): RuleNode => ({ op: 'any', of });

export { any };
