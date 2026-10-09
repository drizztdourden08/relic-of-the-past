/* @layer shared-game @kind logic */
import { RULE_OPTION_KEYS } from './rule-options.constants';
import { readRuleOption } from './read-rule-option';
import type { World } from '../../world.type';
import type { RuleOptionKey, RuleOptionValue } from '../rule-node.type';

const ruleOptionsOfWorld = (world: World): Record<RuleOptionKey, RuleOptionValue> =>
  Object.fromEntries(RULE_OPTION_KEYS.map((key) => [key, readRuleOption(world, key)])) as
    Record<RuleOptionKey, RuleOptionValue>;

export { ruleOptionsOfWorld };
