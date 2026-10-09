/* @layer shared-game @kind logic */
import { bottleContentKeyOf } from '../../shops/shop-price-options';
import { blockedContentNote } from '../blocked-content-note';
import { lostCauldronsOf } from './lost-cauldrons-of';
import { potionPriceOverrides } from './potion-price-overrides';
import type { PotionPriceSelection, ReconciledPotionPrice } from '../potion-price-rule.type';

const reconcilePotionPrices = (selection: PotionPriceSelection): ReconciledPotionPrice => {
  const { shops, prices } = selection;
  const lost = lostCauldronsOf(shops);
  const blockedKeys = new Set(lost.map((row) => bottleContentKeyOf(row.content)));
  const notes = lost.map((row) => blockedContentNote(row.label));
  return {
    prices: { ...prices, ...potionPriceOverrides(shops) },
    notes,
    blockedContents: lost.map((row) => row.content),
    blockedKeys,
  };
};

export { reconcilePotionPrices };
