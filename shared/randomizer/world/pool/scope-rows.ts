/* @layer shared-game @kind logic */
import { NPC_SCOPE_LOCATIONS, WORLD_ITEM_SCOPE_LOCATIONS } from '../scope-tables';
import type { ItemId } from '@shared/game/data/types/ids';
import type { LocationKey } from '../location-key';

const scopeRows = (): Array<[LocationKey, ItemId]> =>
  [...NPC_SCOPE_LOCATIONS, ...WORLD_ITEM_SCOPE_LOCATIONS];

export { scopeRows };
