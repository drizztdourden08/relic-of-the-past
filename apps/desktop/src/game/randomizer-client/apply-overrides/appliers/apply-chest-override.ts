/* @layer bridge-wasm @kind logic */
import { setChestSlotOverride } from '../../../randomizer';
import { logOverride } from './log-override';
import type { OverrideApplier } from './override-applier.type';

const applyChestOverride: OverrideApplier = (entry, context) => {
  if (entry.target === undefined) return;
  const { roomId, chestIndex, targetLocalId } = entry.target;
  setChestSlotOverride(roomId, chestIndex, targetLocalId, context.receiptLineOf(entry.location, targetLocalId));
  logOverride(context.tag, entry, `slot ${chestIndex}`, targetLocalId);
};

export { applyChestOverride };
