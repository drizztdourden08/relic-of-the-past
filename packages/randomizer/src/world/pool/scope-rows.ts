/* @layer shared-game @kind logic */
import { NPC_SCOPE_LOCATIONS, WORLD_ITEM_SCOPE_LOCATIONS } from '../scope-tables';
import type { ItemId } from '@rotp/game-data';
import type { LocationKey } from '../location-key';

const scopeRows = (): Array<[LocationKey, ItemId]> =>
  [...NPC_SCOPE_LOCATIONS, ...WORLD_ITEM_SCOPE_LOCATIONS];

export { scopeRows };
