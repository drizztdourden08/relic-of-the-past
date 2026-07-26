/* @layer shared-game @kind types */
/**
 * Core value types for the gameplay simulator. The raw flag snapshots are
 * byte-for-byte SRAM copies; the simulator only diffs them and never reads
 * check data to decide what happened (see check-matcher for naming).
 */
import type { GridPos, ScreenVariant } from '../navigation/types';
import type { TileAttrContext } from '../navigation/tile-attrs';
import type { TraversalRequirement } from '../navigation/nav-data.types';
import type { CheckDefinition } from '../types';
import type { PresenceGameState } from './presence/state';

// ─── Phases & Outcomes ───────────────────────────────────────────────────────

type SimPhase =
  | 'idle'
  | 'observing'
  | 'planning'
  | 'traversing'
  | 'triggering'
  | 'verifying'
  | 'done';

type SimOutcome = 'completed' | 'stopped-at-check' | 'not-completable';

interface SimConfig {
  /** Halt right after this check triggers. */
  stopAtCheckId?: string;
  /** Goal check whose completion ends the run (default: the final-boss check). */
  goalCheckId?: string;
  /** Stop once this many distinct screens have been visited (for bounded testing). */
  screenLimit?: number;
}

// ─── Virtual Player & Observation ────────────────────────────────────────────

/** Simulated position — the screen the virtual player character explores. */
interface VirtualPlayer {
  screenId: string;
  tile: GridPos;
}

/** Raw SRAM copies used purely for byte-diffing. */
interface FlagSnapshot {
  /** save_dung_info — uint16[320], indexed by room ID. */
  dungInfo: Uint16Array;
  /** save_ow_event_info — uint8[0x82], indexed by overworld screen. */
  owEventInfo: Uint8Array;
  /** WasmGetProgressFlags — 16-byte progress buffer. */
  progress: Uint8Array;
}

interface SimObservation {
  virtual: VirtualPlayer;
  realLocation: SimLocation;
  inventory: Set<string>;
  /** Raw SRAM copies for diffing. */
  flags: FlagSnapshot;
  /** Interactables the runner assembled from the port for the current screen. */
  interactables?: RoomInteractables;
  /** Attr grids for the current screen, used to flood-fill tile reachability. */
  grids?: ScreenGridBundle;
  /**
   * Live-state snapshot the discover step evaluates NPC presence conditions
   * against — the sim's sanctioned single data read (see presence-condition.ts).
   * Optional: when absent, NPC presence gating fails open (all present).
   */
  presenceState?: PresenceGameState;
  /** Item id delivered since the previous step (from onItemReceived). */
  itemReceived?: number;
  /**
   * Exits detected by flooding the current screen in-game (border connections,
   * doors, holes, stairs). When present, traversal runs purely on this
   * discovered graph — the static connection dataset is not consulted.
   */
  exits?: SimExit[];
  /** Flood-reached tiles of the current screen (region memory for re-visits). */
  reached?: boolean[][];
}

/** A big multi-sub-screen overworld area (castle-style 2×2 groups). */
interface SimArea {
  key: string;
  label: string;
  size: number;
}

/** Which detection branch produced an exit. Diagnosis only — never a decision.
 *  A fabricated edge is useless to chase until you know which branch invented it. */
type SimExitOrigin = 'ow-border' | 'ow-entrance' | 'room-border' | 'room-stair' | 'room-door' | 'room-doorway' | 'room-warp' | 'exit-table';

/** A game-detected way off a screen: destination + where the player lands there. */
interface SimExit {
  to: string;
  origin?: SimExitOrigin;
  /**
   * Which way in this crossing uses, as seen from the destination.
   *
   * Arriving on a screen through its west edge says nothing about what is
   * reachable from its east edge, and a wall can carry SEVERAL separate
   * crossings — Uncle's Estate East has two on its west border. Keying explored
   * state on the screen alone therefore skips real ground. For a border the
   * signature is the contiguous tile span the crossing occupies (from the
   * flood's own ConnectionInfo.positions); for a door, hole or stair it is the
   * game's entrance id, already unique.
   */
  edgeSig?: string;
  entryTile?: GridPos;
  /** Border crossings are walkable both ways; holes/doors are not implied so. */
  twoWay?: boolean;
  /** Tile the exit sits on within the flooded screen (walk-distance ordering). */
  fromTile?: GridPos;
  /** Big-area sub-screen the exit physically sits on, when not the visited one. */
  via?: string;
  /**
   * TRUE walk-steps from the entry tile, or undefined when the distance is
   * genuinely unknown. Never carries a sort bias — showing the raw ordering score
   * as a step count is what produced nonsense like "4096 steps".
   */
  steps?: number;
  /** The raw ordering score (may include the out-of-area bias). Sorting only. */
  score?: number;
  /** Why `steps` is missing or qualified: 'other-screen' | 'via-hop'. */
  stepsNote?: 'other-screen' | 'via-hop';
  /** Big area the DESTINATION belongs to (null/absent = a standalone screen). */
  area?: SimArea;
}

/** Identifies which screen/room the room-addressable reads target. */
interface SimLocation {
  isIndoors: boolean;
  /** Room ID for indoor rooms. */
  roomId: number;
  /** Overworld screen index for outdoor screens. */
  owScreenIndex: number;
}

/** Attr grids for a single screen, ready for `floodFillScreen`. */
interface ScreenGridBundle {
  screenIndex: number;
  tileContext: TileAttrContext;
  rawAttrGrid: number[][];
  /** Present for dual-layer indoor rooms. */
  dualLayerGrids?: { layer0: number[][]; layer1: number[][] };
  /** kind_of_in_room_staircase value (2 = layer changes blocked). */
  staircaseType?: number;
  /** Progress-dependent overworld screen variant (post-aga tiles etc.). */
  variant?: ScreenVariant;
}

/** Room-addressable discovery bundle the runner pulls from the port. */
interface RoomInteractables {
  chests: SimChest[];
  sprites: SimSprite[];
  doors: SimDoor[];
  /** Room-header TAG bytes ([tag1, tag2]); [0,0] outdoors/unknown. */
  tags?: [number, number];
}

// ─── Trigger Actions ─────────────────────────────────────────────────────────

type TriggerAction =
  | { type: 'chest'; roomId: number; chestIndex: number; itemId: number }
  | { type: 'npc'; flagType: number; flagMask: number; itemId: number }
  | { type: 'overworld'; screen: number; mask: number; itemId: number }
  | { type: 'boss'; roomId: number; itemId: number; prizeId: number }
  | { type: 'door'; roomId: number; doorIndex: number; doorKind: 'small-key' | 'big-key' | 'bombable'; cellLock?: boolean }
  | { type: 'kill'; roomId: number; itemId: number; opensShutters: boolean }
  | { type: 'trapShutters'; roomId: number }
  | { type: 'pullSwitch'; roomId: number }
  | { type: 'progress'; step: 'follower-join' | 'follower-deliver' };

// ─── Detection ───────────────────────────────────────────────────────────────

type FlagBufferKind = 'room' | 'overworld' | 'progress';

/** A single changed flag location produced by pure byte-diffing. */
interface FlagDiff {
  kind: FlagBufferKind;
  /** roomId (room) | screen (overworld) | bufferIndex (progress). */
  index: number;
  before: number;
  after: number;
  /** Newly set bits: (before ^ after) & after. */
  setBits: number;
}

interface DetectedCheck {
  evidence: FlagDiff[];
  /** Naming only — never used for detection. */
  matched?: CheckDefinition;
  matchedName?: string;
  itemReceived?: string;
  at: VirtualPlayer;
}

// ─── Events ──────────────────────────────────────────────────────────────────

interface SimEvent {
  level: 'narrative' | 'debug';
  msg: string;
  step: number;
  data?: unknown;
}

// ─── Dataset Suggestions ─────────────────────────────────────────────────────

interface DatasetSuggestion {
  kind: 'connection' | 'screen' | 'check';
  /** Relative to shared/game/data/ or shared/game/checks/. */
  targetFile: string;
  /** null = insert a new entry. */
  targetId: string | null;
  /** TS code block, ready for the writer IPC. */
  code: string;
  reason: string;
}

// ─── Softlock Report ─────────────────────────────────────────────────────────

interface SoftlockReport {
  completed: string[];
  blocked: Array<{ checkId: string; missing: TraversalRequirement[][] }>;
  unreachedScreens: string[];
}

// ─── In-game Interactables ───────────────────────────────────────────────────

interface SimChest {
  roomId: number;
  chestIndex: number;
  /** A BIG chest (bit 15 of the chest-room word) — needs the big key to open. */
  isBig: boolean;
  tile: GridPos;
  /** False when the C layer reports posKnown=0 (col=row=0xFF) for a remote room. */
  posKnown: boolean;
  opened: boolean;
  itemId?: number;
}

interface SimSprite {
  roomId: number;
  spriteType: number;
  tile: GridPos;
  /** False when the sprite's tile position is unknown (coarse reachability). */
  posKnown: boolean;
  kind: 'npc' | 'standing' | 'overworld' | 'other';
  itemId?: number;
  /** Drops a small key when defeated (from the room's die-action marker). */
  carriesKey?: boolean;
  /** Drops the BIG key when defeated (0xe4/0xfd marker). */
  carriesBigKey?: boolean;
}

interface SimDoor {
  roomId: number;
  /** Slot in the room's door table — also the open-bit index (slots 0-3). */
  index: number;
  tiles: GridPos[];
  direction: 'n' | 's' | 'e' | 'w';
  kind: 'normal' | 'small-key' | 'big-key' | 'bombable' | 'shutter' | 'switch' | 'trap';
  /** From the room's door-open flag bits. */
  opened: boolean;
  /** A jail-cell keyhole plate (room object 0x18) rather than a door-table door:
   *  `index` is its chest slot and opening it writes that slot's open bit. */
  cellLock?: boolean;
  /** Raw kDoorType — distinguishes doors that share a `kind` (throne push wall
   *  0x14, warp-room door 0x46) and that only the native value identifies. */
  nativeType?: number;
  /** 0 = upper/BG2, 1 = lower/BG1 (door position slots 6-11). */
  layer?: 0 | 1;
}

export type {
  SimPhase,
  SimOutcome,
  SimConfig,
  VirtualPlayer,
  FlagSnapshot,
  SimObservation,
  SimExit,
  SimExitOrigin,
  SimArea,
  SimLocation,
  ScreenGridBundle,
  RoomInteractables,
  TriggerAction,
  FlagBufferKind,
  FlagDiff,
  DetectedCheck,
  SimEvent,
  DatasetSuggestion,
  SoftlockReport,
  SimChest,
  SimSprite,
  SimDoor,
};
