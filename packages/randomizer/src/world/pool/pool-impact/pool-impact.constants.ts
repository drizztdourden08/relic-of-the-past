/* @layer shared-game @kind constants */
import { POND_MODE_KEYS } from '../../pond/pond-option-keys';
import { SHOP_MODE_KEY } from '../../shops/shop-slot-options';
import type { OptionImplementation, OptionValue } from '../../options.type';
import type { PoolImpact } from '../pool.type';

const NEUTRAL_VALUE: Readonly<Record<string, OptionValue>> = {
  key_drop_shuffle: false,
  include_npc_checks: false,
  include_world_items: false,
  dungeon_prize_shuffle: false,
  [SHOP_MODE_KEY]: 'vanilla',
  shop_item_slots: 0,
  shop_slot_depth: 1,
  ...Object.fromEntries(Object.values(POND_MODE_KEYS).map((key) => [key, 'capacity'])),
};

const LOCKED_NOTE: Readonly<Record<OptionImplementation, string>> = {
  active: 'fixed',
  'vanilla-fixed': '0 shuffled',
  'not-implemented': 'n/a',
  'not-applicable': 'n/a',
};

const NO_IMPACT: PoolImpact = { locations: 0, items: 0, note: '' };

export { LOCKED_NOTE, NEUTRAL_VALUE, NO_IMPACT };
