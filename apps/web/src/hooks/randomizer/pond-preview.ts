/* @layer renderer-hooks @kind logic */
/**
 * THE THROW PRICES, as this seed really asks for them.
 *
 * A throw that hands over a prize asks for the demand its rung was rolled with
 * (pond/pond-demand-seed.ts), and that is what its chip shows: the currency's
 * own sprite and the amount she wants. A throw that wins nothing still costs
 * its rupee price, so its chip reads as it always did. An item demand carries
 * no amount at all, so its chip is the item's drawing and its name.
 *
 * The two readouts under the chips follow the same charges. The total counts
 * the rupees the ladder actually takes, and says how many rungs ask for
 * something else, because a mixed ladder cannot be emptied with rupees alone.
 * The wallet line reads the dearest single RUPEE throw on the way to the last
 * prize, and drops out when no rupee is asked for at all.
 *
 * Nothing here rolls anything: the demands arrive already settled, so the
 * panel and the seed cannot disagree.
 */
import { describeRupees } from '@shared/randomizer/ap-world/pond/rupee-gems';
import { currencySpriteOf, priceSpriteOf } from './currency-sprites';
import type { PondDemandView } from '@shared/randomizer/ap-world/pond/pond-ask.type';
import type { PondPlan, PondSetting } from '@shared/randomizer/ap-world/pond/pond-profile.type';
import type { ShopPrice } from '@shared/randomizer/ap-world/shops/shop-price.type';
import type { LadderPreviewProps } from '@domains/app/compounds/LadderPreview';

/** What one throw takes, and in what. */
interface PondCharge {
  /** The demand this throw's rung was rolled with; absent while it only costs its price. */
  demand?: ShopPrice;
  /** Rupees this throw takes out of the wallet; 0 while it asks for something else. */
  rupees: number;
  /** She asks for something the wallet cannot pay. */
  other: boolean;
}

/**
 * One charge per throw: its rung's demand where it has one, its price where it
 * does not. Only a CUSTOM pond asks for a demand at the water
 * (randomizer-client/pond-demand-rows.ts), so a pond at its native economy
 * previews the rupees it charges and nothing else.
 */
const pondChargesOf = (plan: PondPlan, demands: PondDemandView): readonly PondCharge[] =>
  plan.throws.map((entry) => {
    const rung = plan.mode === 'custom' && entry.prize >= 0 ? plan.locations[entry.prize] : undefined;
    const demand = rung === undefined ? undefined : demands[rung];
    if (demand === undefined) return { rupees: entry.price, other: false };
    if (demand.currency === 'rupees') return { demand, rupees: demand.amount, other: false };
    return { demand, rupees: 0, other: true };
  });

/** What the chip says beside the sprite; an item names itself and counts nothing. */
const chipTextOf = (charge: PondCharge, price: number): string => {
  const { demand } = charge;
  if (demand === undefined) return String(price);
  if (demand.currency === 'item') return demand.itemName;
  return String(demand.currency === 'bottle' ? demand.amount ?? 1 : demand.amount);
};

const itemsText = (count: number): string => `${count} pool item${count === 1 ? '' : 's'}`;

/** What the preview says under the chips: the prizes, and what emptying the pond costs. */
const pondPreviewNote = (
  setting: PondSetting, prizeCount: number, charges: readonly PondCharge[],
): string => {
  if (setting.mode === 'capacity') return 'the native purchase loop';
  const prizes = itemsText(prizeCount);
  if (charges.length === 0) return `${prizes}, handed over for nothing`;
  const rupees = charges.reduce((sum, charge) => sum + charge.rupees, 0);
  const others = charges.filter((charge) => charge.other).length;
  if (others === 0) return `${prizes} · ${rupees} rupees to empty`;
  const asks = `${others} other demand${others === 1 ? '' : 's'}`;
  return rupees === 0 ? `${prizes} · ${asks} to empty` : `${prizes} · ${rupees} rupees and ${asks} to empty`;
};

/** The chips, with each throw drawn in the currency its own rung asks for. */
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

/** The dearest single rupee throw on the way to the last prize; none when none is rupees. */
const pondWalletNoteOf = (
  plan: PondPlan, charges: readonly PondCharge[], prizeCount: number,
): string | undefined => {
  if (prizeCount === 0) return undefined;
  const last = plan.throws.findIndex((entry) => entry.prize === prizeCount - 1);
  const reach = charges.slice(0, (last === -1 ? charges.length : last) + 1);
  const dearest = reach.reduce((top, charge) => Math.max(top, charge.rupees), 0);
  if (dearest === 0) return undefined;
  return `wallet must hold ${dearest}, thrown as ${describeRupees(dearest)}`;
};

export { pondChargesOf, pondPreviewNote, pondPreviewOf, pondWalletNoteOf };
export type { PondCharge };
