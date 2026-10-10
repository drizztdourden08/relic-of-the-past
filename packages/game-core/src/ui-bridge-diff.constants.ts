/* @layer bridge-wasm @kind constants */
import type {
  CountdownState, DungeonProgressState, EquipmentState, FloorIndicatorState, GameModeState, HostMenuState, HUDState,
  MapState, SaveMenuState, TextState,
} from '@rotp/game-data';

const INVENTORY_ITEM_SLOTS = 20;
const INVENTORY_BOTTLE_SLOTS = 4;
const INVENTORY_ORDER_SLOTS = 24;

const GAME_MODE_FIELDS = ['mainModule', 'subModule', 'subSubModule'] as const satisfies readonly (keyof GameModeState)[];

const HUD_FIELDS = [
  'healthCurrent', 'healthCapacity', 'magicPower', 'halfMagic', 'rupees', 'rupeeTarget', 'bombs', 'arrows', 'keys',
  'equippedY', 'equippedX', 'equippedL', 'equippedR', 'heartsFiller', 'magicFiller', 'bombFiller', 'arrowFiller',
  'maxRupees', 'maxBombs', 'maxArrows',
] as const satisfies readonly (keyof HUDState)[];

const EQUIPMENT_FIELDS = [
  'sword', 'shield', 'armor', 'gloves', 'boots', 'flippers', 'moonPearl', 'heartPieces', 'abilityFlags',
] as const satisfies readonly (keyof EquipmentState)[];

const DUNGEON_PROGRESS_FIELDS = [
  'pendants', 'crystals', 'maps', 'compasses', 'bigKeys',
] as const satisfies readonly (keyof DungeonProgressState)[];

const TEXT_FIELDS = [
  'messageId', 'isActive', 'renderPhase', 'choice', 'waitTimer', 'incrementalState',
] as const satisfies readonly (keyof TextState)[];

const MAP_FIELDS = [
  'overworldMapState', 'dungeonFloor', 'dungeonIdx', 'roomIndex', 'currentFloor', 'dungeonInitState',
  'overworldScreenIndex', 'isIndoors', 'isDarkWorld', 'overworldAreaIndex', 'whichEntrance', 'linkLayer', 'linkX', 'linkY',
] as const satisfies readonly (keyof MapState)[];

const FLOOR_INDICATOR_FIELDS = ['timer', 'isVisible'] as const satisfies readonly (keyof FloorIndicatorState)[];
const COUNTDOWN_FIELDS = ['seconds', 'frames'] as const satisfies readonly (keyof CountdownState)[];
const SAVE_MENU_FIELDS = ['cursorPosition', 'sourceModule'] as const satisfies readonly (keyof SaveMenuState)[];
const HOST_MENU_FIELDS = ['holding', 'activeItem'] as const satisfies readonly (keyof HostMenuState)[];

export {
  COUNTDOWN_FIELDS, DUNGEON_PROGRESS_FIELDS, EQUIPMENT_FIELDS, FLOOR_INDICATOR_FIELDS, GAME_MODE_FIELDS, HOST_MENU_FIELDS,
  HUD_FIELDS, INVENTORY_BOTTLE_SLOTS, INVENTORY_ITEM_SLOTS, INVENTORY_ORDER_SLOTS, MAP_FIELDS, SAVE_MENU_FIELDS,
  TEXT_FIELDS,
};
