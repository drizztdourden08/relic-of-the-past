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

type RegionType = 'lightWorld' | 'darkWorld' | 'dungeon' | 'cave';

interface CheckDefinition {
  id: string;
  name: string;
  type: CheckType;
  region: string;
  dungeon?: string;
  vanillaItem?: string | string[];
  /** SRAM room index for chest-open flag tracking */
  roomId?: number;
  /** Chest index within the room (0-5, maps to bits 0x100-0x2000) */
  chestIndex?: number;
}

interface RegionDefinition {
  id: string;
  name: string;
  type: RegionType;
  dungeon?: string;
}

interface RegionConnection {
  from: string;
  to: string;
  entrance: string;
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
  CheckDefinition,
  CheckState,
  CheckType,
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
  RegionConnection,
  RegionDefinition,
  RegionType,
  Requirement,
  SaveMenuState,
  SwordMode,
  TextState,
  TrackerState,
  UIMode
};
