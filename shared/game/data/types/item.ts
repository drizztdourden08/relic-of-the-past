/* @layer shared-game @kind types */
import type { DungeonId, ItemId, SpriteId } from './ids';
import type { ItemCategory } from '../taxonomy/item-categories';
import type { WeaponProfile } from './combat';
import type { ItemOrigin } from '../enumeration/generated-types';

interface ItemGameId {
  /** Native Link_ReceiveItem index. Absent for synthetic ids (pendants, crystals, events). */
  receiveItemId?: number;
}

interface ItemRecord {
  id: ItemId;
  gameId?: ItemGameId;
  /** A real in-game item vs. a randomizer-only concept. */
  origin: ItemOrigin;
  category: ItemCategory;
  vanillaName?: string;
  randomizerName: string;
  /** Per-dungeon maps/compasses/keys point at their dungeon by id. */
  dungeonId?: DungeonId;
  /** Progression level for the sword/shield/glove/mail tier. Reverse-engineered (see combat.ts). */
  tier?: number;
  /** Combat facts, weapon items only. */
  weapon?: WeaponProfile;
  /** Folds in the old duplicate-alternates.ts table. */
  aliasOf?: ItemId;
  /** Graphics only. The extracted PNG for this item. */
  spriteId?: SpriteId;
}

export type { ItemGameId, ItemOrigin, ItemRecord };
