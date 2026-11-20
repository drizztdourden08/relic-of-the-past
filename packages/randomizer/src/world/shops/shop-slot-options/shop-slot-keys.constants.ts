/* @layer shared-game @kind data */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { ShopShuffleMode } from '../shop-scope.type';

const SHOP_MODE_KEY = 'shop_shuffle_mode';
const SHOP_SLOT_COUNT_KEY = 'shop_item_slots';
const SHOP_SLOT_DEPTH_KEY = 'shop_slot_depth';

const DEFAULT_SHOP_SHUFFLE_MODE: ShopShuffleMode = 'custom';
const DEFAULT_SHOP_SLOT_DEPTH = 2;

const SHOP_MODE_LABELS: Readonly<Record<string, Message>> = {
  vanilla: msg('randomizer-world:choice.shop.vanilla'),
  sequential: msg('randomizer-world:choice.shop.sequential'),
  random: msg('randomizer-world:choice.shop.random'),
  custom: msg('randomizer-world:choice.shop.custom'),
};


const DEFAULT_OFF_SHOPS: readonly string[] = ['potion-shop'];

export {
  DEFAULT_OFF_SHOPS, DEFAULT_SHOP_SHUFFLE_MODE, DEFAULT_SHOP_SLOT_DEPTH, SHOP_MODE_KEY, SHOP_MODE_LABELS,
  SHOP_SLOT_COUNT_KEY, SHOP_SLOT_DEPTH_KEY,
};
