/* @layer shared-game @kind logic */
import { ITEM } from '../../../item-ids.data';
import { placedIn } from '../../combinators';
import type { LocationKey } from '../../../location-key.type';
import type { Rule } from '../../../world.type';

const finalTowerBigKeyIn = (locations: readonly LocationKey[]): Rule => placedIn(ITEM.bigKeyGanonsTower, locations);

export { finalTowerBigKeyIn };
