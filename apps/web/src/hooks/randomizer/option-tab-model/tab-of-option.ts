/* @layer renderer-hooks @kind logic */
import { familyOfOptionKey } from '@shared/randomizer/world/capacity';
import type { OptionDef } from '@shared/randomizer/world/options.type';
import {
  CAPACITY_BLOCK_KEYS, ENTRANCE_KEYS, ENVIRONMENT_KEYS, GLITCH_KEYS, ITEM_KEYS, MEDALLION_KEYS,
  POND_KEYS, SHOP_KEYS, TRAP_KEYS,
} from './option-tab-keys.constants';
import type { OptionTabId } from './option-tab-model.type';

const tabOfOption = (option: OptionDef): OptionTabId => {
  if (option.group === 'dungeon-items' || MEDALLION_KEYS.has(option.key)) return 'dungeon';
  if (familyOfOptionKey(option.key) !== undefined || CAPACITY_BLOCK_KEYS.has(option.key)) return 'capacity';
  if (POND_KEYS.has(option.key)) return 'pond';
  if (TRAP_KEYS.has(option.key)) return 'traps';
  if (ENVIRONMENT_KEYS.has(option.key)) return 'environmental';
  if (ENTRANCE_KEYS.has(option.key)) return 'entrance';
  if (GLITCH_KEYS.has(option.key)) return 'glitches';
  if (ITEM_KEYS.has(option.key)) return 'items';
  if (SHOP_KEYS.has(option.key)) return 'shops';
  if (option.group === 'enemies') return 'enemies';
  if (option.group === 'timers') return 'timer';
  if (option.group === 'session') return 'world';
  if (option.group === 'goal') return 'goal';
  if (option.group === 'world') return 'world';
  if (option.group === 'items') return 'items';
  if (option.group === 'shops') return 'shops';
  return 'world';
};

export { tabOfOption };
