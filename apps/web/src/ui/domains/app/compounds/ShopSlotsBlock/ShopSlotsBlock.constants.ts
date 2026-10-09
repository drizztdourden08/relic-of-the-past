/* @layer renderer-components @kind constants */
import { SHOP_MODE_LABELS } from '@shared/randomizer/world/shops/shop-slot-options.data';
import { SHOP_SHUFFLE_MODES } from '@shared/randomizer/world/shops/shop-scope';
import type { ShopWorld } from '@shared/randomizer/world/shops/shop-slot-facts';

const MODE_OPTIONS = SHOP_SHUFFLE_MODES.map((mode) => ({ value: mode, label: SHOP_MODE_LABELS[mode] }));

const MODE_TITLE = 'Shop shuffle';

const SLOTS_TITLE = 'Shop slots';

const SLOT_COUNT_LABEL = 'Available shop slots';

const SLOT_COUNT_INERT = 'Only the Sequential and Random modes read this';

const SLOT_COUNT_FOLLOWS_TICKS = 'Set by the ticks above';

const DEPTH_LABEL = 'Items per shop slot';

const VANILLA_TOTAL = 'Nothing shuffled.';

const STOCK_SEPARATOR = ' · ';

const SECTION_ORDER: readonly ShopWorld[] = ['light', 'dark'];

const OFF_BY_DEFAULT_LABEL = 'Off by default';

export {
  DEPTH_LABEL, MODE_OPTIONS, MODE_TITLE, OFF_BY_DEFAULT_LABEL, SECTION_ORDER, SLOTS_TITLE, SLOT_COUNT_FOLLOWS_TICKS,
  SLOT_COUNT_INERT, SLOT_COUNT_LABEL, STOCK_SEPARATOR, VANILLA_TOTAL,
};
