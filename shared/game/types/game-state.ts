/* @layer shared-game @kind types */
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
  /** Current resource caps, the max a counter can reach right now (accounts for upgrades/settings). */
  maxRupees: number;
  maxBombs: number;
  maxArrows: number;
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

/** The HUD countdown the digging game and the Super Bomb share. */
interface CountdownState {
  /** Seconds left, as the game stores them. The sign bit is set while no countdown runs. */
  seconds: number;
  /** Frames left inside the current second. Reloads to 62 when a second comes off. */
  frames: number;
  isRunning: boolean;
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
  countdown: CountdownState;
  saveMenu: SaveMenuState;
}

export type {
  CountdownState,
  DungeonProgressState,
  EquipmentState,
  FloorIndicatorState,
  GameModeState,
  GameUIState,
  HUDState,
  InventoryState,
  MapState,
  SaveMenuState,
  TextState,
  UIMode,
};
