/* @layer shared-game @kind logic */
import { withOptional } from './with-optional';
import type { Rule } from '../../world.type';

const bombs = (quantity?: number): Rule => withOptional('canUseBombs', quantity);

export { bombs };
