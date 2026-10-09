/* @layer shared-game @kind logic */
import { helperRule } from '../combinators';
import type { Rule } from '../../world.type';

const hearts = (count: number): Rule => helperRule('hasHearts', count);

export { hearts };
