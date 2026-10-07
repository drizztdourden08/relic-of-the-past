/* @layer shared-game @kind types */
import type { CheckId, DungeonId, ItemId, SpriteId } from './ids';
import type { ItemCategory } from '../taxonomy/item-categories';
import type { WeaponProfile } from './combat';
import type { ItemOrigin } from '../enumeration/generated-types';
import type { ReviewMark } from './review';

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
  /** The one name this item answers to. */
  name: string;
  /** Per-dungeon maps/compasses/keys point at their dungeon by id. */
  dungeonId?: DungeonId;
  /** Progression level for the sword/shield/glove/mail tier. Reverse-engineered (see combat.ts). */
  tier?: number;
  /**
   * What a seed's fill treats a copy of this item as. Absent reads as filler, which is what
   * the reference's own table means by listing only the first two.
   */
  poolClass?: 'progression' | 'useful' | 'filler';
  /**
   * Every use of this item spends the magic meter.
   *
   * On the meter ladder's empty rung, where nothing can be cast, owning one of these grants
   * nothing, so the collection state reports it absent there (randomizer item-usability.ts).
   * A meter upgrade itself never carries this: an upgrade is what lifts the family off that rung.
   */
  spendsMeter?: true;
  /** Combat facts, weapon items only. */
  weapon?: WeaponProfile;
  /**
   * The stand-in a CHEST pays in place of this item when the player already holds it (the game's
   * own kReceiveItemAlternates table): the Lamp pays 5 rupees, the Blue Boomerang 10 arrows, the
   * Red Boomerang 300 rupees. Only chests swap; a gift or a drop never does.
   */
  aliasOf?: ItemId;
  /** Items kept in the same inventory slot: holding any of them counts as holding this one for the swap. */
  sharesSlotWith?: readonly ItemId[];
  /** The chest a normal file takes this item from first, so every other chest of it pays the stand-in. */
  usualChestId?: CheckId;
  /** Graphics only. The extracted PNG for this item. */
  spriteId?: SpriteId;
  review?: ReviewMark;
}

export type { ItemGameId, ItemOrigin, ItemRecord };
