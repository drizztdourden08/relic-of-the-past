/* @layer shared-game @kind types */
import type { ActorId, CheckId, DungeonId, ItemGroupId, ItemId, ScreenId, TagId } from './ids';
import type { CheckKind } from '../enumeration/generated-types';

interface CheckGameId {
  /** Chest checks (save_dung_info[roomId], CHEST_OPEN_MASKS[chestIndex]) — was checks/flags/room.ts's CHECK_ROOM_FLAGS. */
  roomId?: number;
  chestIndex?: number;
  /** Direct room-mask checks (save_dung_info[roomId] & mask) — was checks/flags/room.ts's DIRECT_ROOM_FLAGS. */
  mask?: number;
  /** Overworld checks (save_ow_event_info[owScreen] & mask) — was checks/flags/overworld.ts. Native OW screen index. */
  owScreen?: number;
  /** Progress-buffer checks (event + NPC) — index into WasmGetProgressFlags()'s buffer. */
  bufferIndex?: number;
  /** Event checks' comparison mode — was checks/flags/event.ts. */
  compare?: 'gte' | 'eq' | 'any-of';
  value?: number | number[];
  /** NPC trigger write — was checks/flags/npc.ts's CHECK_NPC_FLAGS. */
  flagType?: number;
  flagMask?: number;
  /** An NPC whose completion is recorded in a room's chest-open bit instead of a progress byte. */
  roomFlag?: { roomId: number; chestIndex: number };
  /** Native Link_ReceiveItem index the NPC trigger grants — same concept as ItemGameId.receiveItemId, kept here too since the trigger mechanism reads it directly. */
  itemId?: number;
  /** NPC visual-completion state. */
  spriteType?: number;
  postGfx?: number;
  /** Disambiguates an NPC sprite type that spawns in more than one room. */
  room?: number;
  /** Disambiguates an NPC sprite type that isn't unique across light/dark world. */
  owWorld?: 'light' | 'dark';
}

/** Whether a bit(mask) must be clear (all zero) or set (any bit present). */
type BitState = 'clear' | 'set';

/**
 * A declarative expression over live game state deciding whether a check-giving
 * NPC is actually spawned at the current game progress. Ported from
 * checks/presence-condition.ts; `item` is now an ItemId, not a tracker name.
 */
type PresenceCondition =
  | { progressFlag: number; state: BitState }
  | { progressIndicator3: number; state: BitState }
  | { itemId: ItemId; owned: boolean }
  | { follower: 'none' }
  | { followerEq: number }
  | { owEvent: { screen: number; mask: number }; state: BitState }
  | { roomBossDead: number; dead: boolean }
  | { and: PresenceCondition[] }
  | { or: PresenceCondition[] }
  | { not: PresenceCondition };

/**
 * Requirement expression tree — THE requirement type everywhere. Leaves are
 * always ids of the proper kind, never names: an item you must own, a check
 * (events are checks, so no string tokens exist), or N of a named item group.
 * `impossible` is the explicit, typed never-satisfiable sentinel — used where
 * a gate has no real destination (e.g. an unmapped S&Q spawn) rather than a
 * magic string a leaf-evaluator would have to special-case.
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
  /** References into the tag collection — the check's own content (key/big key/map/compass/boss item). */
  tags?: readonly TagId[];
  /** The actor that grants this check — an NPC or a boss, joined on spriteType. */
  actorId?: ActorId;
  /** What collecting demands beyond reaching the screen — replaces the old check-rules table. */
  requirements?: Requirement;
  presence?: PresenceCondition;
  /** What visually happens to the NPC after the check (debug/documentation only). */
  visualNote?: string;
  /** Source function in sprite_main.c (debug/documentation only). */
  sourceFunc?: string;
}

export type { BitState, CheckGameId, CheckKind, CheckRecord, PresenceCondition, Requirement };
