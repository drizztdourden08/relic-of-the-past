/* @layer shared-game @kind logic */
import { helperRule } from '../combinators';
import type { Rule } from '../../world.type';

const crystals = (count: number): Rule => helperRule('hasCrystals', count);

export { crystals };
