/* @layer renderer-lib @kind logic */
/**
 * What the file's own settings hand the rows that are read from the dataset.
 *
 * Two shapes, and both come off the placement, so the plain game and a seed are set the same way:
 *
 *  - OVERRIDES, for the three rows whose requirement is a setting: what the pedestal asks for, and
 *    the medallion each of the two gated entrances wants. Their rules cannot be written into the
 *    dataset because the answer moves with the profile;
 *  - GRANTS, for the two tracker switches. A door whose key is held is open, and a room you carry a
 *    light into is lit, so the switches hand the reader the item instead of rewriting the rule. The
 *    seed's own accepted lights come in this way too: the records name the Lamp, and a player
 *    seeing by a Fire Rod on a seed that counts one reads as seeing.
 *
 * Nothing here is derived from a second rule table. Before this the same four answers came out of a
 * resolver that also carried a copy of every location rule.
 */
import type { MedallionId } from '@shared/randomizer/world/item-groups';
import { hasSword } from '@shared/game/data/requirements/helpers';
import { ITEM_GROUP_IDS } from '@shared/game/data';
import { all } from '@shared/game/data';
import { DARK_ROOM_LIGHT_FIELDS } from '@shared/randomizer/world/dark-rooms';
import { REFERENCE_DARK_ROOM_SETTING } from '@shared/randomizer/world/dark-rooms/dark-room-lights.data';
import type { DarkRoomLightField } from '@shared/randomizer/world/dark-rooms';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { PedestalGate } from '@shared/randomizer/world/story-gates/story-gate.type';
import type { CheckId, ItemId, Requirement } from '@shared/game/data';

/** The one item every unlit-room record names, so granting it is what "can see" means to a record. */
const LAMP: ItemId = 'item-019';
const MOON_PEARL: ItemId = 'item-032';
/** The combined event "All Light World dungeons cleared" (records/checks/events/world.ts, n 283). */
const LIGHT_WORLD_CLEARED: Requirement = { checkId: 'check-583' };
const ALWAYS: Requirement = { allOf: [] };
const LIGHT_ITEM: Readonly<Record<DarkRoomLightField, ItemId>> = {
  lamp: LAMP, fireRod: 'item-008', bombos: 'item-016', redCane: 'item-022',
};

const pedestalRequirement = (gate: PedestalGate | undefined): Requirement => {
  switch (gate) {
    case 'onePendant': return { count: { groupId: ITEM_GROUP_IDS.Pendants, n: 1 } };
    case 'twoPendants': return { count: { groupId: ITEM_GROUP_IDS.Pendants, n: 2 } };
    case 'lightWorldDungeons': return LIGHT_WORLD_CLEARED;
    case 'open': return ALWAYS;
    // Any three dungeons has no single requirement to name, so the pendant count stands in.
    default: return { count: { groupId: ITEM_GROUP_IDS.Pendants, n: 3 } };
  }
};

/** The medallion entrance's own rule: human, armed, and carrying what this seed asks for. */
const medallionRequirement = (medallion: MedallionId): Requirement => ({
  allOf: [{ itemId: MOON_PEARL }, hasSword, { itemId: medallion }],
});

const recordRowOverrides = (placement: Placement): Partial<Record<CheckId, Requirement>> => ({
  'check-312': pedestalRequirement(placement.stats.storyGates?.pedestal),
  'check-344': medallionRequirement(placement.medallions.mire),
  'check-345': medallionRequirement(placement.medallions.turtleRock),
});

/** Every Big Key the dataset knows, by its own item id. */
let bigKeys: readonly ItemId[] | null = null;
const bigKeyItemIds = (): readonly ItemId[] => {
  bigKeys ??= all('item').filter((item) => item.name.startsWith('Big Key (')).map((item) => item.id);
  return bigKeys;
};

/** Whether this file's unlit rooms are lit for this player: no light asked, or one carried. */
const seesInTheDark = (
  placement: Placement, darkRoomsNeedLight: boolean, inventory: ReadonlySet<ItemId>,
): boolean => {
  const setting = placement.stats.darkRooms ?? REFERENCE_DARK_ROOM_SETTING;
  const accepted = DARK_ROOM_LIGHT_FIELDS.filter((field) => setting.lights[field]);
  if (!setting.requireLight || !darkRoomsNeedLight || accepted.length === 0) return true;
  return accepted.some((field) => inventory.has(LIGHT_ITEM[field]));
};

interface GrantParams {
  placement: Placement;
  inventory: ReadonlySet<ItemId>;
  darkRoomsNeedLight: boolean;
  bigKeyDoors: boolean;
}

/** The inventory the record reader sees: what is held, plus what the switches hand over. */
const grantedInventory = (params: GrantParams): ReadonlySet<ItemId> => {
  const { placement, inventory, darkRoomsNeedLight, bigKeyDoors } = params;
  const seeing = seesInTheDark(placement, darkRoomsNeedLight, inventory);
  if (bigKeyDoors && !seeing) return inventory;
  const granted = new Set(inventory);
  if (!bigKeyDoors) for (const id of bigKeyItemIds()) granted.add(id);
  if (seeing) granted.add(LAMP);
  return granted;
};

export { grantedInventory, recordRowOverrides };
export type { GrantParams };
