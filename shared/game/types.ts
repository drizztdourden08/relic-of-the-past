import type { RegionTag } from './data/regions/tags';
import type { ConnectionTag } from './data/connections/tags';
import type { RegionNavData, ConnectionNavData } from './navigation/nav-data.types';

// ─── Check Types ───

type CheckType =
  | 'chest'
  | 'npc'
  | 'standing'
  | 'boss'
  | 'prize'
  | 'keyDrop'
  | 'potItem'
  | 'dig'
  | 'bonk'
  | 'event';

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN DATA MODEL
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Screen Types ───

/**
 * The three fundamental screen contexts in ALttP:
 * - overworld: outdoor OW screens (64 per world, indexed 0x00–0x3F)
 * - dungeon: indoor rooms belonging to a dungeon (keyed by palace index + room)
 * - interior: all other indoor rooms (caves, houses, shops, fairy, etc.)
 */
type ScreenType = 'overworld' | 'dungeon' | 'interior';

/** Which game world this screen belongs to */
type World = 'light' | 'dark';

/** Sub-category for interior screens */
type InteriorKind =
  | 'house'
  | 'cave'
  | 'shop'
  | 'fairy'
  | 'well'
  | 'passage'
  | 'hint'
  | 'gamble'
  | 'special';

// ─── Type-Specific Context ───

interface OverworldContext {
  /** Column in 8×8 OW grid */
  gridX: number;
  /** Row in 8×8 OW grid */
  gridY: number;
  /** Bundle ID — links screens that form one logical area */
  bundle?: string;
}

interface DungeonContext {
  /** Dungeon name — drives game mechanics (keys, map, compass, boss) */
  name: string;
  /** Runtime cur_palace_index_x2 (0x00–0x1A) */
  palaceIndex?: number;
  /** Floor level (-2, -1, 0, 1, 2...) */
  floor?: number;
  /** Column in dungeon room grid */
  gridX?: number;
  /** Row in dungeon room grid */
  gridY?: number;
}

interface InteriorContext {
  /** What kind of interior this is */
  kind: InteriorKind;
}

// ─── Bundle Definition ───

/**
 * Groups multiple screens that are logically "one area" in the game.
 * OW bundles: Lost Woods (4 screens). Interior bundles: Two Brothers House (2 rooms).
 * Dungeon bundles: large rooms spanning multiple supertiles.
 */
interface ScreenBundle {
  id: string;
  name: string;
  /** IDs of screens that form this bundle (ordered) */
  screens: readonly string[];
  layout?: BundleLayout;
}

type BundleLayout =
  | { type: 'grid'; columns: number }
  | { type: 'linear'; direction: 'horizontal' | 'vertical' }
  | { type: 'stacked' };

// ─── Screen Definition (discriminated union) ───

interface ScreenBase {
  id: string;
  /** Screen-specific label ("Dark Cross", "Chest Area", "Lost Woods NW") */
  name: string;
  /** Which game world */
  world: World;
  /** Structural parent — all screens sharing a location are "one place" */
  location: string;
  /** Broad zone for notification line 2 ("Death Mountain", "Kakariko", "East Hyrule") */
  area: string;

  // ─── Game Values ───
  /** Native game room/screen index */
  roomIndex?: number;
  /** Entrance ID (RAM $010E) — disambiguates shared room indices */
  entranceId?: number;

  // ─── Workflow ───
  status?: 'draft' | 'mapped' | 'verified';

  // ─── Metadata ───
  tags: readonly RegionTag[];
  nav?: RegionNavData;
}

interface OverworldScreen extends ScreenBase {
  type: 'overworld';
  overworld: OverworldContext;
}

interface DungeonScreen extends ScreenBase {
  type: 'dungeon';
  dungeon: DungeonContext;
}

interface InteriorScreen extends ScreenBase {
  type: 'interior';
  interior: InteriorContext;
}

type ScreenDefinition = OverworldScreen | DungeonScreen | InteriorScreen;

// ─── Connection ───

interface ScreenConnection {
  from: string;
  to: string;
  tags: readonly ConnectionTag[];
  /** Entrance ID for OW → indoor transitions */
  entranceId?: number;
  /** Stair index (0-3) for inter-room connections */
  stairIndex?: number;
  /** Exit data index for indoor → OW transitions */
  exitId?: number;
  status?: 'draft' | 'mapped' | 'verified';
  nav?: ConnectionNavData;
}

// ─── Check (belongs-to: check → screen) ───

interface CheckDefinition {
  id: string;
  name: string;
  type: CheckType;
  /** Screen ID this check lives in */
  screen: string;
  /** Dungeon name (for key/prize logic) */
  dungeon?: string;
  vanillaItem?: string | string[];
  /** SRAM room index for chest-open flag tracking */
  roomId?: number;
  /** Chest index within the room (0-5, maps to bits 0x100-0x2000) */
  chestIndex?: number;
}

// ─── Requirement Expression Tree ───

type Requirement =
  | string
  | { and: Requirement[] }
  | { or: Requirement[] }
  | { count: [string, number] };

// ─── Tracker State ───

interface CheckState {
  completed: boolean;
  timestamp?: number;
}

interface TrackerState {
  profileId: string;
  checks: Record<string, CheckState>;
  inventory: string[];
  startedAt: number;
}

// ─── Logic Configuration ───

type LogicMode = 'vanilla' | 'open' | 'inverted' | 'no-logic';
type SwordMode = 'normal' | 'swordless' | 'assured';
type Goal = 'ganon' | 'pedestal' | 'triforce-hunt' | 'crystals' | 'bosses';

interface LogicConfig {
  mode: LogicMode;
  /** Region ID where the game starts (default: 'menu') */
  startingRegion: string;
  /** Items the player has at game start (e.g. open mode gives Bombs free) */
  startingItems: string[];
  /** S&Q destinations freely available from Menu (region IDs) */
  saveQuitDestinations: string[];
  /** Whether Moon Pearl is required to be human in DW */
  moonPearlRequired: boolean;
  /** Medallion requirements (randomized per seed) */
  medallionRequirements: {
    miseryMire: 'Ether' | 'Bombos' | 'Quake';
    turtleRock: 'Ether' | 'Bombos' | 'Quake';
  };
  /** Crystals needed to enter Ganon's Tower */
  crystalsForGT: number;
  /** Crystals needed to damage Ganon */
  crystalsForGanon: number;
  /** Pendants needed for Master Sword Pedestal */
  pendantsForPedestal: number;
  /** Sword mode */
  swordMode: SwordMode;
  /** Game goal */
  goal: Goal;
  /** Whether overworld entrances are shuffled */
  overworldShuffle: boolean;
  /** Whether dungeon entrances are shuffled */
  dungeonShuffle: boolean;
  /** Whether small keys are in the general item pool */
  keysanity: boolean;
  /** Whether big keys are in the general item pool */
  bigKeyShuffle: boolean;
}

// ─── Game UI Overlay State ───

type UIMode =
  | 'gameplay'
  | 'paused_menu'
  | 'text'
  | 'dungeon_map'
  | 'overworld_map'
  | 'flute_menu'
  | 'save_menu'
  | 'game_over'
  | 'save_and_quit'
  | 'loading'
  | 'title';

interface HUDState {
  healthCurrent: number;
  healthCapacity: number;
  magicPower: number;
  halfMagic: boolean;
  rupees: number;
  rupeeTarget: number;
  bombs: number;
  arrows: number;
  keys: number;
  equippedY: number;
  equippedX: number;
  equippedL: number;
  equippedR: number;
  heartsFiller: number;
  magicFiller: number;
  bombFiller: number;
  arrowFiller: number;
}

interface InventoryState {
  /** 20 item slots: bow through mirror */
  items: number[];
  /** 4 bottle contents */
  bottles: number[];
  /** 24-byte inventory grid order */
  order: number[];
}

interface EquipmentState {
  sword: number;
  shield: number;
  armor: number;
  gloves: number;
  boots: number;
  flippers: number;
  moonPearl: number;
  abilityFlags: number;
  heartPieces: number;
}

interface DungeonProgressState {
  pendants: number;
  crystals: number;
  maps: number;
  compasses: number;
  bigKeys: number;
}

interface TextState {
  messageId: number;
  messagingModule: number;
  renderPhase: number;
  incrementalState: number;
  choice: number;
  waitTimer: number;
  isActive: boolean;
}

interface MapState {
  overworldMapState: number;
  dungeonFloor: number;
  dungeonIdx: number;
  dungeonInitState: number;
  palaceIndex: number;
  roomIndex: number;
  currentFloor: number;
  overworldScreenIndex: number;
  overworldAreaIndex: number;
  isIndoors: boolean;
  isDarkWorld: boolean;
  whichEntrance: number;
  linkLayer: number;
  linkX: number;
  linkY: number;
}

interface FloorIndicatorState {
  timer: number;
  floor: number;
  isVisible: boolean;
}

interface SaveMenuState {
  cursorPosition: number;
  sourceModule: number;
  progressIndicator: number;
}

interface GameModeState {
  mainModule: number;
  subModule: number;
  subSubModule: number;
}

interface GameUIState {
  mode: UIMode;
  gameMode: GameModeState;
  hud: HUDState;
  inventory: InventoryState;
  equipment: EquipmentState;
  dungeonProgress: DungeonProgressState;
  text: TextState;
  map: MapState;
  floorIndicator: FloorIndicatorState;
  saveMenu: SaveMenuState;
}

export type {
  // ─── Screen Data Model ───
  BundleLayout,
  CheckDefinition,
  CheckType,
  DungeonContext,
  DungeonScreen,
  InteriorContext,
  InteriorKind,
  InteriorScreen,
  OverworldContext,
  OverworldScreen,
  ScreenBase,
  ScreenBundle,
  ScreenConnection,
  ScreenDefinition,
  ScreenType,
  World,
  // ─── Game State ───
  CheckState,
  DungeonProgressState,
  EquipmentState,
  FloorIndicatorState,
  GameModeState,
  GameUIState,
  Goal,
  HUDState,
  InventoryState,
  LogicConfig,
  LogicMode,
  MapState,
  Requirement,
  SaveMenuState,
  SwordMode,
  TextState,
  TrackerState,
  UIMode,
};
