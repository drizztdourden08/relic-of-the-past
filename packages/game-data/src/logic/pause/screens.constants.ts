/* @layer shared-game @kind constants */
import type { PauseScreen, PauseSection } from './pause.type';
import { GEAR_LADDER_KINDS } from './gear-tiers.constants';

const ITEM_COLUMNS = 6;
const DEFAULT_ITEM_CELLS = 20;
const DEFAULT_BOTTLE_CELLS = 4;
const PASSIVE_COUNT = 4;
const ACTION_COUNT = 2;
const SAVE_QUIT_CURSOR = 1;

const SCREEN_ORDER: readonly PauseScreen[] = ['items', 'gear', 'status'];

const SCREEN_SECTIONS: Record<PauseScreen, readonly PauseSection[]> = {
  items: ['items', 'bottles'],
  gear: [...GEAR_LADDER_KINDS, 'passive'],
  status: ['actions'],
};

export {
  ACTION_COUNT, DEFAULT_BOTTLE_CELLS, DEFAULT_ITEM_CELLS, ITEM_COLUMNS, PASSIVE_COUNT, SAVE_QUIT_CURSOR, SCREEN_ORDER,
  SCREEN_SECTIONS,
};
