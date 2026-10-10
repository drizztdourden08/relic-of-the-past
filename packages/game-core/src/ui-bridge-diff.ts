/* @layer bridge-wasm @kind logic */
import type { GameUIState } from '@rotp/game-data';
import {
  COUNTDOWN_FIELDS, DUNGEON_PROGRESS_FIELDS, EQUIPMENT_FIELDS, FLOOR_INDICATOR_FIELDS, GAME_MODE_FIELDS, HOST_MENU_FIELDS,
  HUD_FIELDS, INVENTORY_BOTTLE_SLOTS, INVENTORY_ITEM_SLOTS, INVENTORY_ORDER_SLOTS, MAP_FIELDS, SAVE_MENU_FIELDS,
  TEXT_FIELDS,
} from './ui-bridge-diff.constants';

const fieldsDiffer = <T>(a: T, b: T, fields: readonly (keyof T)[]): boolean =>
  fields.some((field) => a[field] !== b[field]);

const slotsDiffer = (a: readonly unknown[], b: readonly unknown[], count: number): boolean =>
  Array.from({ length: count }, (_slot, i) => i).some((i) => a[i] !== b[i]);

const inventoryChanged = (a: GameUIState, b: GameUIState): boolean =>
  slotsDiffer(a.inventory.items, b.inventory.items, INVENTORY_ITEM_SLOTS)
  || slotsDiffer(a.inventory.bottles, b.inventory.bottles, INVENTORY_BOTTLE_SLOTS)
  || slotsDiffer(a.inventory.order, b.inventory.order, INVENTORY_ORDER_SLOTS);

const playerChanged = (a: GameUIState, b: GameUIState): boolean =>
  a.mode !== b.mode
  || fieldsDiffer(a.gameMode, b.gameMode, GAME_MODE_FIELDS)
  || fieldsDiffer(a.hud, b.hud, HUD_FIELDS)
  || fieldsDiffer(a.equipment, b.equipment, EQUIPMENT_FIELDS)
  || fieldsDiffer(a.dungeonProgress, b.dungeonProgress, DUNGEON_PROGRESS_FIELDS);

const stateChanged = (a: GameUIState, b: GameUIState): boolean =>
  playerChanged(a, b)
  || fieldsDiffer(a.text, b.text, TEXT_FIELDS)
  || fieldsDiffer(a.map, b.map, MAP_FIELDS)
  || fieldsDiffer(a.floorIndicator, b.floorIndicator, FLOOR_INDICATOR_FIELDS)
  || fieldsDiffer(a.countdown, b.countdown, COUNTDOWN_FIELDS)
  || fieldsDiffer(a.saveMenu, b.saveMenu, SAVE_MENU_FIELDS)
  || fieldsDiffer(a.hostMenu, b.hostMenu, HOST_MENU_FIELDS)
  || inventoryChanged(a, b);

export { stateChanged };
