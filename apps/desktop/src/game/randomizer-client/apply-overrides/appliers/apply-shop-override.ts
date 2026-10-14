/* @layer bridge-wasm @kind logic */
import { armedShopState } from '@rotp/randomizer';
import { setShopSlotOverride } from '../../../shop-overrides';
import { allocateFireId } from '../../override-fire-registry';
import { logOverride } from './log-override';
import type { OverrideApplier } from './override-applier.type';

const applyShopOverride: OverrideApplier = (entry, context) => {
  if (entry.shopOverride === undefined) return;
  const { targetLocalId, ...target } = entry.shopOverride;
  setShopSlotOverride(target, targetLocalId, context.receiptLineOf(entry.location, targetLocalId), allocateFireId(entry.location));
  armedShopState.entries.push({
    location: entry.location, slotIndex: target.slotIndex, depthIndex: target.depthIndex,
  });
  logOverride(context.tag, entry, 'shelf slot', targetLocalId);
};

export { applyShopOverride };
