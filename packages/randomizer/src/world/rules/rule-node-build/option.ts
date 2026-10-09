/* @layer shared-game @kind logic */
import type { RuleNode, RuleOptionKey, RuleOptionValue } from '../rule-node.type';

const option = (key: RuleOptionKey, equals: RuleOptionValue): RuleNode => ({ op: 'option', key, equals });

export { option };
