/* @layer shared-game @kind logic */
import { compileRule } from '../rule-eval';
import { has } from '../rule-node-build';
import type { Holding } from '../../collection-state.type';
import type { Rule } from '../../world.type';

const hasItem = (item: Holding, count = 1): Rule => compileRule(has(item, count));

export { hasItem };
