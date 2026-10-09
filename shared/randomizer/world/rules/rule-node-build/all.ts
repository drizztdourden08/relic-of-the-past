/* @layer shared-game @kind logic */
import type { RuleNode } from '../rule-node.type';

const all = (...of: readonly RuleNode[]): RuleNode => ({ op: 'all', of });

export { all };
