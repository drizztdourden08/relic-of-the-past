/* @layer renderer-lib @kind constants */
import type { DarkRoomLightField } from '@shared/randomizer/world/dark-rooms';
import type { ItemId, Requirement } from '@rotp/game-data';

const LAMP: ItemId = 'item-019';
const MOON_PEARL: ItemId = 'item-032';
const LIGHT_WORLD_CLEARED: Requirement = { checkId: 'check-583' };
const ALWAYS: Requirement = { allOf: [] };
const LIGHT_ITEM: Readonly<Record<DarkRoomLightField, ItemId>> = {
  lamp: LAMP, fireRod: 'item-008', bombos: 'item-016', redCane: 'item-022',
};

export { LAMP, MOON_PEARL, LIGHT_WORLD_CLEARED, ALWAYS, LIGHT_ITEM };
