/* @layer shared-game @kind logic */
import { compileRule } from '../rule-eval';
import { hasAny } from '../rule-node-build';
import type { Holding } from '../../collection-state.type';
import type { Rule } from '../../world.type';

const hasAnyItem = (items: readonly Holding[]): Rule => compileRule(hasAny(items));

export { hasAnyItem };
