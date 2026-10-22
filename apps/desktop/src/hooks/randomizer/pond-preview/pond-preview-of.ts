/* @layer renderer-hooks @kind logic */
import { currencySpriteOf, priceSpriteOf } from '../currency-sprites';
import type { PondPlan, PondSetting } from '@rotp/randomizer';
import type { PondPreviewModel } from '@app/compounds/WishingPondRow';
import type { PondCharge } from './pond-preview.type';
import { itemAt } from '@app/checked-access';
import { pondPreviewNote } from './pond-preview-note';

const NO_PRIZE_LABEL = 'no prize';

const chipTextOf = (charge: PondCharge, price: number): string => {
  const { demand } = charge;
  if (demand === undefined) return String(price);
  if (demand.currency === 'item') return demand.itemName;
  return String(demand.currency === 'bottle' ? demand.amount ?? 1 : demand.amount);
};

const pondPreviewOf = (
  setting: PondSetting, plan: PondPlan, charges: readonly PondCharge[], prizeCount: number,
): PondPreviewModel => ({
  steps: plan.throws.map((entry, index) => {
    const charge = itemAt(charges, index);
    return {
      key: `throw-${index}`,
      label: entry.prize >= 0 ? `prize ${entry.prize + 1}` : NO_PRIZE_LABEL,
      sprite: charge.demand === undefined ? currencySpriteOf('rupees') : priceSpriteOf(charge.demand),
      value: chipTextOf(charge, entry.price),
      active: setting.mode !== 'capacity',
    };
  }),
  note: pondPreviewNote(setting, prizeCount, charges),
});

export { pondPreviewOf };
