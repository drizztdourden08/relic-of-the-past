/* @layer shared-game @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { POND_MODE_KEYS } from '../../pond/pond-option-keys';
import { SHOP_MODE_KEY } from '../../shops/shop-slot-options';
import type { Message } from '@drizztdourden08/brock-core/i18n';
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

const LOCKED_NOTE: Readonly<Record<OptionImplementation, Message>> = {
  active: msg('randomizer-world:pool.fixed'),
  'vanilla-fixed': msg('randomizer-world:pool.zeroShuffled'),
  'not-implemented': msg('randomizer-world:pool.na'),
  'not-applicable': msg('randomizer-world:pool.na'),
};

const NO_IMPACT: PoolImpact = { locations: 0, items: 0, note: '' };

export { LOCKED_NOTE, NEUTRAL_VALUE, NO_IMPACT };
