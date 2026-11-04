/* @layer shared-game @kind constants */
import {
  allOf as allOfRules, anyOf as anyOfRules, canCollect as canCollectRule, canReach as canReachRule,
  either as eitherRule, exitRule as exitRuleOf, hasAnyItem as hasAnyItemRule, hasItem as hasItemRule,
  helperRule as helperRuleOf, placedAt as placedAtRule, placedIn as placedInRule,
} from '@drizztdourden08/brock-randomizer/world';
import { compileRule } from '../rule-eval';
import { FALSE, TRUE } from '../rule-node-build';
import { HELPER_REGISTRY } from '../helpers-registry/helper-registry.constants';
import type { RegionId } from '@rotp/game-data';
import type { ItemKey } from '../../item-ids';
import type { LocationKey } from '../../location-key.type';
import type { Holding } from '../../collection-state.type';
import type { RotpKeys } from '../../rotp-keys.type';
import type { Rule } from '../../world.type';
import type { HelperName, RuleArg } from '../rule-node.type';

const always: Rule = compileRule(TRUE);

const never: Rule = compileRule(FALSE);

const allOf = (...rules: readonly Rule[]): Rule => allOfRules<RotpKeys>(...rules);

const anyOf = (...rules: readonly Rule[]): Rule => anyOfRules<RotpKeys>(...rules);

const canCollect = (location: LocationKey): Rule => canCollectRule<RotpKeys>(location);

const canReach = (id: RegionId): Rule => canReachRule<RotpKeys>(id);

const either = (condition: Rule, whenTrue: Rule, whenFalse: Rule): Rule =>
  eitherRule<RotpKeys>(condition, whenTrue, whenFalse);

const exitRule = (name: string): Rule => exitRuleOf<RotpKeys>(name);

const hasAnyItem = (items: readonly Holding[]): Rule => hasAnyItemRule<RotpKeys>(items);

const hasItem = (item: Holding, count = 1): Rule => hasItemRule<RotpKeys>(item, count);

const helperRule = (name: HelperName, ...args: readonly RuleArg[]): Rule =>
  helperRuleOf<RotpKeys>(HELPER_REGISTRY, name, ...args);

const placedAt = (location: LocationKey, item: ItemKey): Rule => placedAtRule<RotpKeys>(location, item);

const placedIn = (item: ItemKey, locations: readonly LocationKey[]): Rule => placedInRule<RotpKeys>(item, locations);

export {
  allOf, always, anyOf, canCollect, canReach, either, exitRule, hasAnyItem, hasItem, helperRule, never, placedAt,
  placedIn,
};
