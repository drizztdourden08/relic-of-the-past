/* @layer shared-game @kind types */
import type { HelperDefinition as WorldHelperDefinition } from '@drizztdourden08/brock-randomizer/world';
import type { RotpWorld } from '../world.type';
import type { RuleOptionValue } from './rule-node.type';

type HelperArgValue = RuleOptionValue;

type HelperDefinition = WorldHelperDefinition<RotpWorld>;

export type { HelperArgValue, HelperDefinition };
