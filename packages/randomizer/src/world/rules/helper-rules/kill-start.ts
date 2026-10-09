/* @layer shared-game @kind logic */
import { withOptional } from './with-optional';
import type { Rule } from '../../world.type';

const killStart = (enemies?: number): Rule => withOptional('canKillStandardStart', enemies);

export { killStart };
