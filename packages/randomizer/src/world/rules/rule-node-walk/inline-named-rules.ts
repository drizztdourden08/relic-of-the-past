/* @layer shared-game @kind logic */
import { inlineNamedRules as inlineWorldRules } from '@drizztdourden08/brock-randomizer/world';
import { HELPER_REGISTRY } from '../helpers-registry/helper-registry.constants';
import type { RotpKeys } from '../../rotp-keys.type';
import type { World } from '../../world.type';
import type { RuleNode } from '../rule-node.type';

const inlineNamedRules = (node: RuleNode, world: World): RuleNode =>
  inlineWorldRules<RotpKeys>(node, world, HELPER_REGISTRY);

export { inlineNamedRules };
