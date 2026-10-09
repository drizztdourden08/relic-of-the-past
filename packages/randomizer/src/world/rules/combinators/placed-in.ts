/* @layer shared-game @kind logic */
import { compileRule } from '../rule-eval';
import { any } from '../rule-node-build';
import type { ItemKey } from '../../item-ids.data';
import type { LocationKey } from '../../location-key.type';
import type { Rule } from '../../world.type';

const placedIn = (item: ItemKey, locations: readonly LocationKey[]): Rule =>
  compileRule(any(...locations.map((location) => ({ op: 'placedAt' as const, location, item }))));

export { placedIn };
