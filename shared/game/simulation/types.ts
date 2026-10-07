/* @layer shared-game @kind types */
/** Flag snapshots are raw SRAM copies; the simulator only byte-diffs them and never reads check data to decide what happened (see check-matcher). */
import type { GridPos, ScreenVariant } from '../navigation/types';
import type { TraversalRequirement } from '../navigation/nav-data.types';
import type { CheckId, CheckRecord, ItemId } from '../data';
import type { TraversalId } from './traversal-id';
import type { PresenceGameState } from './presence/state';
import type { RoomSectionSplit } from './room-section';

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
  stopAtCheckId?: CheckId;
  /** Goal check whose completion ends the run (default: the final-boss check). */
  goalCheckId?: CheckId;
  /** Stop once this many distinct screens have been visited (for bounded testing). */
  screenLimit?: number;
}

/** Simulated position: the screen the virtual player character explores. */
interface VirtualPlayer {
  screenId: TraversalId;
  tile: GridPos;
}

/** Raw SRAM copies used purely for byte-diffing. */
interface FlagSnapshot {
  /** save_dung_info, a uint16[320] indexed by room ID. */
  dungInfo: Uint16Array;
  /** save_ow_event_info, a uint8[0x82] indexed by overworld screen. */
  owEventInfo: Uint8Array;
  /** The 16-byte progress buffer from WasmGetProgressFlags. */
  progress: Uint8Array;
}

interface SimObservation {
  virtual: VirtualPlayer;
  realLocation: SimLocation;
  /** Items held, by dataset id (the tracker's own set, passed through). */
  inventory: Set<ItemId>;
  /** Raw SRAM copies for diffing. */
  flags: FlagSnapshot;
  /** Interactables the runner assembled from the port for the current screen. */
  interactables?: RoomInteractables;
  /** Attr grids for the current screen, used to flood-fill tile reachability. */
  grids?: ScreenGridBundle;
  /** Live-state snapshot for NPC presence conditions, the sim's one sanctioned
   *  data read (see presence-condition.ts). Absent: presence gating fails open. */
  presenceState?: PresenceGameState;
  /** Item delivered since the previous step (from onItemReceived). The tracker
   *  already resolves the native id to a record, so the id travels intact instead
   *  of being flattened to a native number and looked up again downstream. */
  itemReceived?: ItemId;
  /** Exits detected by flooding the current screen in-game. When present,
   *  traversal runs on this graph alone and never consults the static connection dataset. */
  exits?: SimExit[];
  /** Flood-reached tiles of the current screen (region memory for re-visits). */
  reached?: boolean[][];
  /** Combat rows for the sprite types on the current screen, resolved via the port. */
  combat?: CombatContext;
  /** Which axes of the current indoor room split into separate scrolling
   *  sections. Undefined outdoors or when no room is loaded. */
  sectionSplit?: RoomSectionSplit;
}

/** Resolved per-sprite-type damage row: initial health, initial flags4, and
 *  the 16-entry damage-by-class table already reduced through the game's own
 *  two-step lookup. */
interface SpriteCombatInfo {
  health: number;
  flags4: number;
  damageByClass: number[];
}

/** Shared ancilla (projectile) damage-class table and tile-attribute ->
 *  projectile-collision table (0 pass, 1 block, 2 sloped, 3 layer-dependent,
 *  4 priority flip). */
interface CombatTables {
  ancillaDamageClass: number[];
  projectileTileCollision: number[];
}

/**
 * Combat rows for the sprites on the current screen. `tables` is null when the
 * developer-tools combat gate is off: combat reasoning is then unavailable and
 * every gating sprite must read as not killable. `bySpriteType` has one row per
 * sprite type seen; a missing/null row means the query missed.
 */
interface CombatContext {
  tables: CombatTables | null;
  bySpriteType: Record<number, SpriteCombatInfo | null>;
}

/** A big multi-sub-screen overworld area (castle-style 2×2 groups). */
interface SimArea {
  key: string;
  label: string;
  size: number;
}

/** Which detection branch produced an exit. For diagnosis only. Never a decision.
 *  A fabricated edge is useless to chase until you know which branch invented it. */
type SimExitOrigin = 'ow-border' | 'ow-entrance' | 'room-border' | 'room-stair' | 'room-door' | 'room-doorway' | 'room-warp' | 'exit-table';

/** A game-detected way off a screen: destination + where the player lands there. */
interface SimExit {
  to: TraversalId;
  origin?: SimExitOrigin;
  /**
   * Which way in this crossing uses, as seen from the destination. A wall can
   * carry several separate crossings, so explored state keyed on the screen
   * alone skips real ground. Border: the contiguous tile span the crossing
   * occupies (from the flood's ConnectionInfo.positions). Door, hole or stair:
   * the game's entrance id.
   */
  edgeSig?: string;
  entryTile?: GridPos;
  /** Border crossings are walkable both ways; holes/doors are not implied so. */
  twoWay?: boolean;
  /** Tile the exit sits on within the flooded screen (walk-distance ordering). */
  fromTile?: GridPos;
  /** Big-area sub-screen the exit physically sits on, when not the visited one. */
  via?: TraversalId;
  /** TRUE walk-steps from the entry tile, or undefined when unknown. Never carries
   *  a sort bias: showing the raw ordering score as a step count produced "4096 steps". */
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
  indoors: boolean;
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

type TriggerAction =
  | { type: 'chest'; roomId: number; chestIndex: number; itemId: number }
  | { type: 'npc'; flagType: number; flagMask: number; itemId: number }
  | { type: 'overworld'; screen: number; mask: number; itemId: number }
  | { type: 'boss'; roomId: number; itemId: number; prizeId: number }
  | { type: 'door'; roomId: number; doorIndex: number; doorKind: 'small-key' | 'big-key' | 'bombable'; cellLock?: boolean }
  | { type: 'kill'; roomId: number; itemId: number; opensShutters: boolean }
  | { type: 'trapShutters'; roomId: number }
  /** Blast a cracked wall open. Bombs are permanent once obtained, so this needs
   *  no count (see flood/bombed-walls.ts). */
  | { type: 'bombWall'; roomId: number; tile: GridPos }
  /** `drain` is set when the switch's effect reaches beyond its own room, onto a
   *  remote overworld screen's event byte instead of a local shutter. */
  | { type: 'pullSwitch'; roomId: number; drain?: { screen: number; mask: number } }
  | { type: 'progress'; step: 'follower-join' | 'follower-deliver' | 'shelf-push' | 'sage-quest' };

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
  /** The identified check's record, for display and dungeon attribution, never detection. */
  matched?: CheckRecord;
  /** Which check this was, absent when the diff matched none. */
  checkId?: CheckId;
  itemReceived?: ItemId;
  at: VirtualPlayer;
}

interface SimEvent {
  level: 'narrative' | 'debug';
  msg: string;
  step: number;
  data?: unknown;
}

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

interface SoftlockReport {
  completed: CheckId[];
  blocked: Array<{ checkId: CheckId; missing: TraversalRequirement[][] }>;
  unreachedScreens: string[];
}

interface SimChest {
  roomId: number;
  chestIndex: number;
  /** A BIG chest (bit 15 of the chest-room word). Needs the big key to open. */
  isBig: boolean;
  tile: GridPos;
  /** False when the C layer reports posKnown=0 (col=row=0xFF) for a remote room. */
  posKnown: boolean;
  opened: boolean;
  itemId?: number;
}

interface SimSprite {
  roomId: number;
  /**
   * True when this came from the OVERWORLD spawn table, so `roomId` is a screen
   * index, not a room. `kind` cannot answer this (a check-giving NPC is 'npc'
   * indoors or out), and it has to be answerable because the screen index says
   * which world the sprite is in (see NpcCheckConfig.owWorld).
   */
  outdoor?: boolean;
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
  /** Slot in the room's door table, which is also the open-bit index (slots 0-3). */
  index: number;
  tiles: GridPos[];
  direction: 'n' | 's' | 'e' | 'w';
  kind: 'normal' | 'small-key' | 'big-key' | 'bombable' | 'shutter' | 'switch' | 'trap';
  /** From the room's door-open flag bits. */
  opened: boolean;
  /** A jail-cell keyhole plate (room object 0x18), not a door-table door:
   *  `index` is its chest slot and opening it writes that slot's open bit. */
  cellLock?: boolean;
  /** Raw kDoorType: tells apart doors that share a `kind` (throne push wall
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
  SpriteCombatInfo,
  CombatTables,
  CombatContext,
  RoomSectionSplit,
};
