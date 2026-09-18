/* @layer shared-game @kind logic */
/**
 * PresenceGameState is the read-only snapshot of live game state that
 * `evaluatePresence` reads to decide whether a check-giving NPC is spawned.
 * Every field is sourced from a raw game read; the live port fills it each
 * observe via `buildPresenceState`. Plain scalars + array-likes keep it cheap
 * to build and trivial to construct in tests.
 */
import type { ItemId, PresenceCondition } from '../../data';

interface PresenceGameState {
  /** sram_progress_flags byte (0xF3C6). */
  progressFlags: number;
  /** sram_progress_indicator byte (0xF3C5). */
  progressIndicator: number;
  /** sram_progress_indicator_3 byte (0xF3C9). */
  progressIndicator3: number;
  /** follower_indicator (tagalong id; 0 = none, 0xF3CC). */
  followerIndicator: number;
  /** Items currently held, by dataset id (the tracker's inventory Set). */
  inventory: ReadonlySet<ItemId>;
  /** save_ow_event_info bytes, indexed by overworld screen (0xF280 base). */
  owEventInfo: ArrayLike<number>;
  /** save_dung_info words, indexed by room id (bit 0x8000 = boss/room cleared). */
  roomState: ArrayLike<number>;
  /** The live facts behind the status pills; absent on a snapshot with no live core (the sim, the offline reader). */
  status?: StoryStatus;
}

/** WasmGetStoryStatusBytes, byte for byte (core/game-hooks/story_status.c). */
interface StoryStatus {
  darkWorld: boolean;
  bunny: boolean;
  crystalSwitchFlipped: boolean;
  desertStatuesMoved: boolean;
}

const storyStatusOf = (bytes: ArrayLike<number>): StoryStatus => ({
  darkWorld: (bytes[0] ?? 0) !== 0,
  bunny: (bytes[1] ?? 0) !== 0,
  crystalSwitchFlipped: (bytes[2] ?? 0) !== 0,
  desertStatuesMoved: (bytes[3] ?? 0) !== 0,
});

/**
 * Raw inputs the live port hands in. `progress` is the 19-byte buffer from
 * WasmGetProgressFlags (byte layout documented in checks/flags/npc.ts, with
 * follower_indicator at index 13); the other two are the SRAM copies the sim
 * already snapshots for flag diffing.
 */
interface PresenceStateInput {
  progress: ArrayLike<number>;
  owEventInfo: ArrayLike<number>;
  roomState: ArrayLike<number>;
  inventory: ReadonlySet<ItemId>;
  /** The WasmGetStoryStatusBytes bytes, when a live core is there to read them. */
  statusBytes?: ArrayLike<number>;
}

const PROGRESS_INDICATOR = 0;
const PROGRESS_FLAGS = 1;
const PROGRESS_INDICATOR_3 = 2;
const PROGRESS_FOLLOWER = 13;

const buildPresenceState = ({ progress, owEventInfo, roomState, inventory, statusBytes }: PresenceStateInput): PresenceGameState => ({
  progressFlags: progress[PROGRESS_FLAGS] ?? 0,
  progressIndicator: progress[PROGRESS_INDICATOR] ?? 0,
  progressIndicator3: progress[PROGRESS_INDICATOR_3] ?? 0,
  followerIndicator: progress[PROGRESS_FOLLOWER] ?? 0,
  inventory,
  owEventInfo,
  roomState,
  ...(statusBytes !== undefined ? { status: storyStatusOf(statusBytes) } : {}),
});

/** A zeroed snapshot for the idle / no-map path (nothing is discoverable then). */
const emptyPresenceState = (): PresenceGameState => ({
  progressFlags: 0,
  progressIndicator: 0,
  progressIndicator3: 0,
  followerIndicator: 0,
  inventory: new Set<ItemId>(),
  owEventInfo: [],
  roomState: [],
});

export { buildPresenceState, emptyPresenceState, storyStatusOf };
export type { PresenceGameState, PresenceStateInput, PresenceCondition, StoryStatus };
