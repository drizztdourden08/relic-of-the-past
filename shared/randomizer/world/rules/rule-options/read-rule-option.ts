/* @layer shared-game @kind logic */
import { RULE_OPTIONS } from './rule-options.constants';
import type { World } from '../../world.type';
import type { RuleOptionKey, RuleOptionValue } from '../rule-node.type';

const readRuleOption = (world: World, key: RuleOptionKey): RuleOptionValue => RULE_OPTIONS[key](world);

export { readRuleOption };
