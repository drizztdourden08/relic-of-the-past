/* @layer shared-game @kind logic */
import type { Rule } from '../../../world.type';
import type { RuleEntry } from '../../rule-entry.type';

const exitRow = (rule: Rule) => (target: string): RuleEntry => ({ kind: 'exit', target, mode: 'add', rule });

export { exitRow };
