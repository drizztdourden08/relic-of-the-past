/* @layer renderer-hooks @kind constants */
import { CAPACITY_BONUS_KEYS, CAPACITY_ENABLED_KEY, CAPACITY_PROGRESSIVE_KEY } from '@rotp/randomizer';
import { POND_OPTION_KEYS } from '@rotp/randomizer';
import { MEDALLION_OPTION_KEYS } from '@rotp/randomizer';

const POND_KEYS: ReadonlySet<string> = new Set(POND_OPTION_KEYS);

const CAPACITY_BLOCK_KEYS: ReadonlySet<string> = new Set([
  CAPACITY_ENABLED_KEY, CAPACITY_PROGRESSIVE_KEY, ...CAPACITY_BONUS_KEYS,
]);

const TRAP_KEYS: ReadonlySet<string> = new Set(['beemizer_total_chance', 'beemizer_trap_chance']);

const ENVIRONMENT_KEYS: ReadonlySet<string> = new Set([
  'shuffle_prizes', 'pot_shuffle', 'bush_shuffle', 'tile_shuffle',
]);

const ENTRANCE_KEYS: ReadonlySet<string> = new Set([
  'entrance_shuffle', 'entrance_shuffle_seed', 'plando_connections',
]);

const GLITCH_KEYS: ReadonlySet<string> = new Set(['glitches_required', 'glitch_boots']);

const ITEM_KEYS: ReadonlySet<string> = new Set(['start_inventory_from_pool']);

const SHOP_KEYS: ReadonlySet<string> = new Set(['scams']);

const MEDALLION_KEYS: ReadonlySet<string> = new Set(MEDALLION_OPTION_KEYS);

export {
  CAPACITY_BLOCK_KEYS,
  ENTRANCE_KEYS,
  ENVIRONMENT_KEYS,
  GLITCH_KEYS,
  ITEM_KEYS,
  MEDALLION_KEYS,
  POND_KEYS,
  SHOP_KEYS,
  TRAP_KEYS,
};
