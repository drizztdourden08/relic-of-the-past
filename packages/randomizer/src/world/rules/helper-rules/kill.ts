/* @layer shared-game @kind logic */
import { withOptional } from './with-optional';
import type { Rule } from '../../world.type';

const kill = (enemies?: number): Rule => withOptional('canKillMostThings', enemies);

export { kill };
