/* @layer shared-game @kind logic */
import { compileRule } from '../rule-eval';
import { region } from '../rule-node-build';
import type { RegionId } from '@rotp/game-data';
import type { Rule } from '../../world.type';

const canReach = (id: RegionId): Rule => compileRule(region(id));

export { canReach };
