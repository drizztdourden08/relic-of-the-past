/* @layer shared-game @kind constants */
import { HELPER_REGISTRY } from '../helpers-registry/helper-registry.constants';
import { ROTP_WORLD_KIT } from '../../rotp-world-kit.constants';
import type { Rule } from '../../world.type';
import type { HelperName, RuleArg } from '../rule-node.type';

const {
  allOf, always, anyOf, canCollect, canReach, either, exitRule, hasAnyItem, hasItem, never, placedAt, placedIn,
} = ROTP_WORLD_KIT;

const helperRule = (name: HelperName, ...args: readonly RuleArg[]): Rule =>
  ROTP_WORLD_KIT.helperRule(HELPER_REGISTRY, name, ...args);

export {
  allOf, always, anyOf, canCollect, canReach, either, exitRule, hasAnyItem, hasItem, helperRule, never, placedAt,
  placedIn,
};
