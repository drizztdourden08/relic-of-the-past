/* @layer shared-game @kind logic */
import { compileRule as compileWorldRule } from '@drizztdourden08/brock-randomizer/world';
import { HELPER_REGISTRY } from '../helpers-registry/helper-registry.constants';
import type { RotpKeys } from '../../rotp-keys.type';
import type { Rule } from '../../world.type';
import type { RuleNode } from '../rule-node.type';

const compileRule = (node: RuleNode): Rule => compileWorldRule<RotpKeys>(node, HELPER_REGISTRY);

export { compileRule };
