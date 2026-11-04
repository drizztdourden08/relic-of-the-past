/* @layer shared-game @kind logic */
import { ROTP_WORLD_KIT } from '../../rotp-world-kit.constants';
import { HELPER_REGISTRY } from '../helpers-registry/helper-registry.constants';
import type { Rule } from '../../world.type';
import type { RuleNode } from '../rule-node.type';

const compileRule = (node: RuleNode): Rule => ROTP_WORLD_KIT.compileRule(node, HELPER_REGISTRY);

export { compileRule };
