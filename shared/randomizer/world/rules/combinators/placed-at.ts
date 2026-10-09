/* @layer shared-game @kind logic */
import { compileRule } from '../rule-eval';
import type { ItemKey } from '../../item-ids.data';
import type { LocationKey } from '../../location-key.type';
import type { Rule } from '../../world.type';

const placedAt = (location: LocationKey, item: ItemKey): Rule =>
  compileRule({ op: 'placedAt', location, item });

export { placedAt };
