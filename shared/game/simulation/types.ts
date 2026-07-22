/* @layer shared-game @kind types */
/**
 * Core value types for the gameplay simulator. The raw flag snapshots are
 * byte-for-byte SRAM copies; the simulator only diffs them and never reads
 * check data to decide what happened (see check-matcher for naming).
 */
import type { GridPos } from '../navigation/types';
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
  /** Goal check whose completion ends the run (default: Ganon). */
  goalCheckId?: string;
}

// ─── Virtual Link & Observation ──────────────────────────────────────────────

/** Simulated position — the screen the virtual Link explores. */
interface VirtualLink {
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
  virtual: VirtualLink;
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
}

/** Room-addressable discovery bundle the runner pulls from the port. */
interface RoomInteractables {
  chests: SimChest[];
  sprites: SimSprite[];
  doors: SimDoor[];
}

// ─── Trigger Actions ─────────────────────────────────────────────────────────

type TriggerAction =
  | { type: 'chest'; roomId: number; chestIndex: number; itemId: number }
  | { type: 'npc'; flagType: number; flagMask: number; itemId: number }
  | { type: 'overworld'; screen: number; mask: number; itemId: number }
  | { type: 'boss'; roomId: number; itemId: number; prizeId: number };

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
  at: VirtualLink;
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
}

interface SimDoor {
  roomId: number;
  tiles: GridPos[];
  direction: 'n' | 's' | 'e' | 'w';
  kind: 'normal' | 'small-key' | 'big-key' | 'bombable' | 'shutter' | 'switch' | 'trap';
  /** From the room's door-open flag bits. */
  opened: boolean;
}

export type {
  SimPhase,
  SimOutcome,
  SimConfig,
  VirtualLink,
  FlagSnapshot,
  SimObservation,
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
