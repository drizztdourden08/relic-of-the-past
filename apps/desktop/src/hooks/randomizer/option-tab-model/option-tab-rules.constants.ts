/* @layer renderer-hooks @kind constants */
import { familyOfOptionKey } from '@rotp/randomizer';
import type { OptionDef } from '@rotp/randomizer';
import {
  CAPACITY_BLOCK_KEYS, ENTRANCE_KEYS, ENVIRONMENT_KEYS, GLITCH_KEYS, ITEM_KEYS, MEDALLION_KEYS,
  POND_KEYS, SHOP_KEYS, TRAP_KEYS,
} from './option-tab-keys.constants';
import type { OptionTabId, OptionTabRule } from './option-tab-model.type';

const OPTION_TAB_RULES: readonly OptionTabRule[] = [
  { tab: 'dungeon', matches: (option) => option.group === 'dungeon-items' || MEDALLION_KEYS.has(option.key) },
  { tab: 'capacity', matches: (option) => familyOfOptionKey(option.key) !== undefined || CAPACITY_BLOCK_KEYS.has(option.key) },
  { tab: 'pond', matches: (option) => POND_KEYS.has(option.key) },
  { tab: 'traps', matches: (option) => TRAP_KEYS.has(option.key) },
  { tab: 'environmental', matches: (option) => ENVIRONMENT_KEYS.has(option.key) },
  { tab: 'entrance', matches: (option) => ENTRANCE_KEYS.has(option.key) },
  { tab: 'glitches', matches: (option) => GLITCH_KEYS.has(option.key) },
  { tab: 'items', matches: (option) => ITEM_KEYS.has(option.key) },
  { tab: 'shops', matches: (option) => SHOP_KEYS.has(option.key) },
];

const GROUP_TAB: Readonly<Partial<Record<OptionDef['group'], OptionTabId>>> = {
  enemies: 'enemies',
  timers: 'timer',
  goal: 'goal',
  items: 'items',
  shops: 'shops',
};

export { GROUP_TAB, OPTION_TAB_RULES };
