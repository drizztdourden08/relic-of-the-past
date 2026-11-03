/* @layer renderer-widgets @kind logic */
import type { SlotSpec } from '../ItemsTab.type';
import { givableTier } from './givable-tier';
import type { SlotCellLookParams } from './slot-cell-look.type';

const slotCellLook = (spec: SlotSpec, params: SlotCellLookParams) => {
  const { value, owned, ghostSprite, spritesBase } = params;
  return {
    owned,
    menu: owned,
    ghost: ghostSprite ? `${spritesBase}${ghostSprite}.png` : null,
    title: spec.tiers.find((tier) => tier.value === value)?.label ?? givableTier(spec)?.label ?? spec.nameKey,
  };
};

export { slotCellLook };
