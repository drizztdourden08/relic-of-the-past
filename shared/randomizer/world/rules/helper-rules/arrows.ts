/* @layer shared-game @kind logic */
import { withOptional } from './with-optional';
import type { Rule } from '../../world.type';

const arrows = (count?: number): Rule => withOptional('canShootArrows', count);

export { arrows };
