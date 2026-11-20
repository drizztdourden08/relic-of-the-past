/* @layer renderer-components @kind constants */
import { SHOP_MODE_LABELS, SHOP_SHUFFLE_MODES } from '@rotp/randomizer';
import type { ShopWorld } from '@rotp/randomizer';

const MODE_OPTIONS = SHOP_SHUFFLE_MODES.map((mode) => {
  const label = SHOP_MODE_LABELS[mode];
  if (label === undefined) throw new Error(`No label for shop shuffle mode ${mode}`);
  return { value: mode, label };
});

const STOCK_SEPARATOR = ' · ';

const SECTION_ORDER: readonly ShopWorld[] = ['light', 'dark'];

export { MODE_OPTIONS, SECTION_ORDER, STOCK_SEPARATOR };
