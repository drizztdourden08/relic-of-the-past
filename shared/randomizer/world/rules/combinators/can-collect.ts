/* @layer shared-game @kind logic */
import { compileRule } from '../rule-eval';
import type { LocationKey } from '../../location-key.type';
import type { Rule } from '../../world.type';

const canCollect = (location: LocationKey): Rule => compileRule({ op: 'location', location });

export { canCollect };
