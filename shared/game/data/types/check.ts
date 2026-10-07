/* @layer shared-game @kind types */
import type { ActorId, CheckId, DungeonId, ItemGroupId, ItemId, RegionId, ScreenId, TagId } from './ids';
import type { CheckKind } from '../enumeration/generated-types';
import type { ReviewMark } from './review';

interface CheckGameId {
  /** Chest checks (save_dung_info[roomId], CHEST_OPEN_MASKS[chestIndex]). */
  roomId?: number;
  chestIndex?: number;
  /** Direct room-mask checks (save_dung_info[roomId] & mask). */
  mask?: number;
  /** Overworld checks (save_ow_event_info[owScreen] & mask). Native OW screen index. */
  owScreen?: number;
  /** Index into the WasmGetProgressFlags() buffer, for event and NPC checks. */
  bufferIndex?: number;
  /** Event checks' comparison mode. */
  compare?: 'gte' | 'eq' | 'any-of';
  value?: number | number[];
  /** NPC trigger write. */
  flagType?: number;
  flagMask?: number;
  /** An NPC whose completion is recorded in a room's chest-open bit instead of a progress byte. */
  roomFlag?: { roomId: number; chestIndex: number };
  /** Native Link_ReceiveItem index the NPC trigger grants (same as ItemGameId.receiveItemId; the trigger mechanism reads it directly). */
  itemId?: number;
  /** NPC visual-completion state. */
  spriteType?: number;
  postGfx?: number;
  /** Disambiguates an NPC sprite type that spawns in more than one room. */
  room?: number;
  /** Disambiguates an NPC sprite type that isn't unique across light/dark world. */
  owWorld?: 'light' | 'dark';
  /** Bit index into the event ledger (core/game-hooks/events/event_ids.h): an event the game never records for itself. */
  eventBit?: number;
  /**
   * A shop slot's physical seam, the address the port arms a substitution at.
   *
   * The unmodified game gives neither every shop its own room nor every shop its own
   * entrance: four dark-world doors share entrance 0x60 into one shelf room, and two cave
   * doors share entrance 0x58 into another. What tells them apart is where the player walked
   * in from, which the game keeps for the whole indoor visit
   * (`overworld_area_index_exit`, set by Dungeon_LoadEntrance). So the seam is
   * (room, entrance, overworld area, subtype), with `null` meaning "match anything" for a
   * field the earlier ones already name the shop on their own
   * (core/game-hooks/shop_table.h).
   *
   * It is a seam address and never a completion flag: the unmodified game records nothing at
   * all for a bought shelf item, and the port's own per-slot sold counter is indexed by
   * `shop.slot`, not by anything here.
   */
  shopSeam?: { roomId: number; entrance: number | null; owArea: number | null; subtype: number };
}

/** Which shelf position a slot sits at; also the order the game spawns its sprites. */
type ShopSlotPosition = 'Left' | 'Center' | 'Right' | 'Single';

/**
 * Which physical seam sells a slot. Each has its own sprite family, its own purchase
 * gesture and its own gated call-site in core/game-hooks.
 */
type ShopSeamKind = 'shelf' | 'cauldron' | 'bomb';

/** The shop a shop-slot check sells from, and the slot's place in the whole shop surface. */
interface CheckShop {
  /** The shop this slot stands in; every slot of one shop repeats it. */
  shopId: string;
  /**
   * Canonical slot index across every shop, counting from zero: the index of this slot's
   * sold counter in the save block (`SRM_SHOP_SOLD`, core/game-hooks/save_bytes.h) and the
   * order the sequential mode opens slots in. APPEND ONLY, so a stored placement keeps
   * naming the slots it named.
   */
  slot: number;
  position: ShopSlotPosition;
  seam: ShopSeamKind;
}

/** The three fairy ponds, by the name this app addresses each one with. */
type PondId = 'capacity' | 'wishing' | 'cursed';

/** The pond a pond-slot check belongs to, and which rung of its ladder the slot is. */
interface CheckPond {
  pondId: PondId;
  /** Rung of the pond's ladder, counting from one. */
  rung: number;
  /**
   * The tier ladder this slot heads, when the pond sells one ladder per answer. The
   * capacity pond does: its bomb answer and its arrow answer each climb seven purchases,
   * so the slot is rung 1 of that family's ladder and not the pond's Nth prize. Absent at
   * a pond whose slots are plain prizes.
   */
  ladder?: string;
}

/** Whether a bit(mask) must be clear (all zero) or set (any bit present). */
type BitState = 'clear' | 'set';

/** Expression over live game state deciding whether a check-giving NPC is spawned at the current progress. */
type PresenceCondition =
  | { progressFlag: number; state: BitState }
  | { progressIndicator3: number; state: BitState }
  | { itemId: ItemId; owned: boolean }
  | { follower: 'none' }
  | { followerEq: number }
  | { owEvent: { screen: number; mask: number }; state: BitState }
  | { roomBossDead: number; dead: boolean }
  /** The story stage (sram_progress_indicator) is exactly, or below, this value. */
  | { progressIndicatorEq: number }
  | { progressIndicatorLt: number }
  /** Live facts from WasmGetStoryStatusBytes (core/game-hooks/story_status.c); false when the snapshot has none. */
  | { darkWorld: boolean }
  | { bunny: boolean }
  | { crystalSwitchFlipped: boolean }
  | { desertStatuesMoved: boolean }
  | { and: PresenceCondition[] }
  | { or: PresenceCondition[] }
  | { not: PresenceCondition };

/**
 * Requirement expression tree, THE requirement type everywhere. Leaves are ids,
 * never names: an item to own, a check (events are checks), or N of an item
 * group. `impossible` is the typed never-satisfiable sentinel for a gate with
 * no real destination (e.g. an unmapped S&Q spawn).
 */
type Requirement =
  | { itemId: ItemId }
  | { checkId: CheckId }
  | { count: { groupId: ItemGroupId; n: number } }
  | { anyOf: readonly Requirement[] }
  | { allOf: readonly Requirement[] }
  | { impossible: true };

interface CheckRecord {
  id: CheckId;
  gameId: CheckGameId;
  kind: CheckKind;
  /** Absent for a handful of pure progress-buffer events with no specific screen (e.g. story-progress checks). */
  screenId?: ScreenId;
  /**
   * The region of the reachability partition this row sits in, which is what the engine's
   * graph hangs a location off. It is NOT derivable from `screenId`: the partition is finer
   * than a screen in the places it splits one room into wings, and sixteen regions have no
   * screen of their own at all. So the row says where it is, the same way a screen does.
   *
   * Absent on a row that stands for no place: a held item, a status, a combined event over
   * other rows.
   */
  regionId?: RegionId;
  dungeonId?: DungeonId;
  /**
   * The part of a dungeon this row is named after, when the dungeon's own name is not it:
   * 'Sewers' under the first castle. An empty string means the row stands alone with no
   * prefix at all (the sanctuary, a boss fight). Absent means the dungeon's name.
   */
  subArea?: string;
  /** The one name this row answers to; `standardNameOfCheck` prefixes it with the dungeon. */
  name: string;
  vanillaItemIds: ItemId[];
  /**
   * Which app-scope switch decides whether this row is a location of the seed at all. With
   * its switch off, a scoped row is pre-placed locked with its own vanilla item and left out
   * of the fill. Whether a scope-less row is a location depends on its kind, which is the
   * whole rule (randomizer/world/seed-locations.ts).
   *
   * 'key-drop' rows exist only under the key-drop option; 'capacity' rows are the capacity
   * pond's pair, which exists only while its family is not vanilla.
   *
   * 'fixed' is the opposite of the rest: a real pickup the seed never fills, so no switch
   * reaches it and `vanillaItemIds` stays what the chest table says it holds.
   */
  scope?: 'npc' | 'world-item' | 'key-drop' | 'capacity' | 'fixed';
  /** Rupees the check charges before it hands anything over; a shop slot's shelf price. */
  price?: number;
  shop?: CheckShop;
  pond?: CheckPond;
  /**
   * Set on a virtual location with no vanilla item of its own (a pond slot
   * past the reference's two): true means the seed still hands over a real
   * item here, so the reward filter must not read the empty vanillaItemIds
   * as "no reward". Absent everywhere else; vanillaItemIds alone decides.
   */
  isGuaranteedReward?: boolean;
  /** The check's own content (key/big key/map/compass/boss item), as tag collection references. */
  tags?: readonly TagId[];
  /** The actor that grants this check (an NPC or a boss), joined on spriteType. */
  actorId?: ActorId;
  /** What collecting demands beyond reaching the screen. */
  requirements?: Requirement;
  presence?: PresenceCondition;
  /** What visually happens to the NPC after the check (debug/documentation only). */
  visualNote?: string;
  /** Source function in sprite_main.c (debug/documentation only). */
  sourceFunc?: string;
  /**
   * A combined event: complete when this expression over other records holds. Evaluated after
   * the native sweep, in record order, so a combined event only names records before it.
   */
  derived?: Requirement;
  /** An event that happens on the first of several places reached: any one of these screens opens it. */
  reachAny?: readonly ScreenId[];
  /** A check the game keeps no flag for: a plain file answers from this vanilla fact (a seed arms its own bit). */
  fallback?: Requirement;
  /** The live "is it true right now" side of a reversible event, shown as a status, never unticking the row. */
  now?: PresenceCondition;
  /** A status with no "ever" fact of its own (rain, the bunny form): the row's tick follows `now`. */
  statusOnly?: true;
  /** Which Events section an event record lists under. */
  eventGroup?: EventGroup;
  /**
   * A combined event over a dungeon's own records: complete when every record of that
   * dungeon whose kind is listed, or which carries the tag, is complete.
   */
  derivedDungeon?: { dungeonId: DungeonId; kinds?: readonly CheckKind[]; tag?: string };
  review?: ReviewMark;
}

/** The sections of the tracker's Events view. */
type EventGroup = 'story' | 'dungeon' | 'held' | 'fairy' | 'area' | 'combined' | 'status';

export type {
  BitState, CheckGameId, CheckKind, CheckPond, CheckRecord, CheckShop, EventGroup, PondId,
  PresenceCondition, Requirement, ShopSeamKind, ShopSlotPosition,
};
