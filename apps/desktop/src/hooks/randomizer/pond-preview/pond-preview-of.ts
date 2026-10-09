/* @layer renderer-hooks @kind logic */
import { currencySpriteOf, priceSpriteOf } from '../currency-sprites';
import type { PondPlan, PondSetting } from '@rotp/randomizer';
import type { LadderPreviewProps } from '@app/compounds/LadderPreview';
import type { PondCharge } from './pond-preview.type';
import { pondPreviewNote } from './pond-preview-note';

const chipTextOf = (charge: PondCharge, price: number): string => {
  const { demand } = charge;
  if (demand === undefined) return String(price);
  if (demand.currency === 'item') return demand.itemName;
  return String(demand.currency === 'bottle' ? demand.amount ?? 1 : demand.amount);
};

const pondPreviewOf = (
  setting: PondSetting, plan: PondPlan, charges: readonly PondCharge[], prizeCount: number,
): LadderPreviewProps => ({
  chips: plan.throws.map((entry, index) => chipTextOf(charges[index], entry.price)),
  icons: charges.map((charge) => (charge.demand === undefined
    ? currencySpriteOf('rupees')
    : priceSpriteOf(charge.demand))),
  jumps: plan.throws.slice(1).map((entry) => (entry.prize >= 0 ? 'prize' : '·')),
  dim: setting.mode === 'capacity',
  note: pondPreviewNote(setting, prizeCount, charges),
});

export { pondPreviewOf };
