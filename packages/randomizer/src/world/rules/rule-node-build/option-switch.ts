/* @layer shared-game @kind logic */
import { option } from './option';
import { when } from './when';
import type { RuleNode, RuleOptionKey, RuleOptionValue } from '../rule-node.type';

const optionSwitch = (
  key: RuleOptionKey, cases: readonly (readonly [RuleOptionValue, RuleNode])[], fallback: RuleNode,
): RuleNode => cases.reduceRight<RuleNode>(
  (otherwise, [value, then]) => when(option(key, value), then, otherwise),
  fallback,
);

export { optionSwitch };
