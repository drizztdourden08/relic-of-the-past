/* @layer shared-game @kind logic */
/**
 * PresenceGameState — the read-only snapshot of live game state that
 * `evaluatePresence` reads to decide whether a check-giving NPC is spawned.
 * Every field is sourced from a raw game read; the live port fills it each
 * observe via `buildPresenceState`. Plain scalars + array-likes keep it cheap
 * to build and trivial to construct in tests.
 */
import type { PresenceCondition } from '../../checks/presence-condition';

interface PresenceGameState {
  /** sram_progress_flags byte (0xF3C6). */
  progressFlags: number;
  /** sram_progress_indicator byte (0xF3C5). */
  progressIndicator: number;
  /** sram_progress_indicator_3 byte (0xF3C9). */
  progressIndicator3: number;
  /** follower_indicator (tagalong id; 0 = none, 0xF3CC). */
  followerIndicator: number;
  /** Item names currently held (tracker inventory Set). */
  inventory: ReadonlySet<string>;
  /** save_ow_event_info bytes, indexed by overworld screen (0xF280 base). */
  owEventInfo: ArrayLike<number>;
  /** save_dung_info words, indexed by room id (bit 0x8000 = boss/room cleared). */
  roomState: ArrayLike<number>;
}

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
  inventory: ReadonlySet<string>;
}

const PROGRESS_INDICATOR = 0;
const PROGRESS_FLAGS = 1;
const PROGRESS_INDICATOR_3 = 2;
const PROGRESS_FOLLOWER = 13;

const buildPresenceState = ({ progress, owEventInfo, roomState, inventory }: PresenceStateInput): PresenceGameState => ({
  progressFlags: progress[PROGRESS_FLAGS] ?? 0,
  progressIndicator: progress[PROGRESS_INDICATOR] ?? 0,
  progressIndicator3: progress[PROGRESS_INDICATOR_3] ?? 0,
  followerIndicator: progress[PROGRESS_FOLLOWER] ?? 0,
  inventory,
  owEventInfo,
  roomState,
});

/** A zeroed snapshot for the idle / no-map path (nothing is discoverable then). */
const emptyPresenceState = (): PresenceGameState => ({
  progressFlags: 0,
  progressIndicator: 0,
  progressIndicator3: 0,
  followerIndicator: 0,
  inventory: new Set<string>(),
  owEventInfo: [],
  roomState: [],
});

export { buildPresenceState, emptyPresenceState };
export type { PresenceGameState, PresenceStateInput, PresenceCondition };
