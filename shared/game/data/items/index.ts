/* @layer shared-game @kind data */
import type { ItemRecord } from '../types';
import { DUNGEON_ITEMS_1 } from './dungeon-items-1';
import { DUNGEON_ITEMS_2 } from './dungeon-items-2';
import { DUNGEON_ITEMS_3 } from './dungeon-items-3';
import { EQUIPMENT_ITEMS_1 } from './equipment-1';
import { EQUIPMENT_ITEMS_2 } from './equipment-2';
import { JUNK_ITEMS_1 } from './junk-1';
import { JUNK_ITEMS_2 } from './junk-2';
import { PROGRESSION_ITEMS } from './progression';
import { RANDOMIZER_ITEMS } from './randomizer';
import { WEAPON_ITEMS } from './weapons';

const DUNGEON_ITEMS: ItemRecord[] = [...DUNGEON_ITEMS_1, ...DUNGEON_ITEMS_2, ...DUNGEON_ITEMS_3];
const EQUIPMENT_ITEMS: ItemRecord[] = [...EQUIPMENT_ITEMS_1, ...EQUIPMENT_ITEMS_2];
const JUNK_ITEMS: ItemRecord[] = [...JUNK_ITEMS_1, ...JUNK_ITEMS_2];

const ALL_ITEMS: ItemRecord[] = [
  ...DUNGEON_ITEMS,
  ...EQUIPMENT_ITEMS,
  ...JUNK_ITEMS,
  ...PROGRESSION_ITEMS,
  ...RANDOMIZER_ITEMS,
  ...WEAPON_ITEMS,
];

export { ALL_ITEMS };
