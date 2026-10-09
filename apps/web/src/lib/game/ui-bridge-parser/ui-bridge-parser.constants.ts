/* @layer bridge-wasm @kind constants */
import type { UIMode } from '@shared/game/types';

const MODULE = {
  intro: 0,
  fileSelect: 1,
  copyFile: 2,
  eraseFile: 3,
  nameFile: 4,
  dungeon: 7,
  overworld: 9,
  fallingEntrance: 11,
  interface: 14,
  gameOver: 18,
  attract: 20,
  saveAndQuit: 23,
} as const;

const TITLE_MODULES: readonly number[] = [
  MODULE.intro, MODULE.fileSelect, MODULE.copyFile, MODULE.eraseFile, MODULE.nameFile, MODULE.attract,
];

const LOADING_MODULES: readonly number[] = [5, 6, 8, 10, 15, 16];

const INTERFACE_TEXT_SUBMODULE = 2;

const INTERFACE_SUBMODULE_MODES: Record<number, UIMode> = {
  1: 'paused_menu',
  [INTERFACE_TEXT_SUBMODULE]: 'text',
  3: 'dungeon_map',
  7: 'overworld_map',
  10: 'flute_menu',
  11: 'save_menu',
};

const OVERWORLD_SPECIAL_AREA_SCREEN_MIN = 128;

const COUNTDOWN_IDLE_BIT = 0x80;

const INVENTORY_ITEM_COUNT = 20;
const INVENTORY_ORDER_COUNT = 24;
const BOTTLE_COUNT = 4;

const UI_BUFFER = {
  mainModule: 0,
  subModule: 1,
  subSubModule: 2,
  healthCurrent: 3,
  healthCapacity: 4,
  magicPower: 5,
  magicConsumption: 6,
  rupees: 7,
  rupeeTarget: 9,
  bombs: 11,
  arrows: 12,
  keys: 13,
  equippedY: 14,
  equippedX: 15,
  equippedL: 16,
  equippedR: 17,
  heartsFiller: 18,
  magicFiller: 19,
  bombFiller: 20,
  arrowFiller: 21,
  items: 22,
  bottles: 42,
  sword: 46,
  shield: 47,
  armor: 48,
  gloves: 49,
  boots: 50,
  flippers: 51,
  moonPearl: 52,
  pendants: 53,
  crystals: 54,
  maps: 55,
  compasses: 57,
  bigKeys: 59,
  messageId: 61,
  messagingModule: 63,
  renderPhase: 64,
  incrementalState: 65,
  choice: 66,
  waitTimer: 67,
  overworldMapState: 69,
  dungeonFloor: 70,
  dungeonIdx: 72,
  dungeonInitState: 74,
  palaceIndex: 75,
  roomIndex: 77,
  currentFloor: 79,
  floorTimer: 80,
  abilityFlags: 81,
  sourceModule: 82,
  progressIndicator: 83,
  order: 84,
  overworldScreenIndex: 109,
  isIndoors: 111,
  isDarkWorld: 112,
  overworldAreaIndex: 113,
  heartPieces: 114,
  whichEntrance: 119,
  linkLayer: 120,
  linkX: 121,
  linkY: 123,
  maxBombs: 125,
  maxArrows: 126,
  maxRupees: 127,
  countdownSeconds: 129,
  countdownFrames: 130,
  hostMenuHolding: 131,
  hostMenuActiveItem: 132,
} as const;

export {
  MODULE,
  TITLE_MODULES,
  LOADING_MODULES,
  INTERFACE_TEXT_SUBMODULE,
  INTERFACE_SUBMODULE_MODES,
  OVERWORLD_SPECIAL_AREA_SCREEN_MIN,
  COUNTDOWN_IDLE_BIT,
  INVENTORY_ITEM_COUNT,
  INVENTORY_ORDER_COUNT,
  BOTTLE_COUNT,
  UI_BUFFER,
};
