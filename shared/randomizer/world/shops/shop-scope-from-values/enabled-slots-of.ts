/* @layer shared-game @kind logic */
import { normalizeEnabled } from '../shop-scope';
import { SHOP_SLOT_ROWS } from '../shop-slot-options.data';
import type { OptionValues } from '../../options.type';

const enabledSlotsOf = (values: OptionValues): readonly number[] => normalizeEnabled(
  SHOP_SLOT_ROWS.filter((row) => (values[row.key] ?? row.defaultOn) === true).map((row) => row.canonicalIndex),
);

export { enabledSlotsOf };
