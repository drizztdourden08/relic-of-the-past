/* @layer shared-game @kind types */
import type { ActorId, CheckId, DungeonId, ItemGroupId, ItemId, ScreenId, TagId } from './ids';
import type { CheckKind, ReviewStatus } from '../enumeration/generated-types';

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
  dungeonId?: DungeonId;
  vanillaName?: string;
  randomizerName: string;
  vanillaItemIds: ItemId[];
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
  /** Certification verdict, set by the data-certification pipeline; generation refuses checks below 'accepted'. */
  review?: ReviewStatus;
  /**
   * A combined event: complete when this expression over other records holds. Evaluated after
   * the native sweep, in record order, so a combined event only names records before it.
   */
  derived?: Requirement;
  /** An event with its own ledger bit that an older file can still answer from a vanilla fact. */
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
}

/** The sections of the tracker's Events view. */
type EventGroup = 'story' | 'dungeon' | 'held' | 'fairy' | 'area' | 'combined' | 'status';

export type { BitState, CheckGameId, CheckKind, CheckRecord, EventGroup, PresenceCondition, Requirement };
