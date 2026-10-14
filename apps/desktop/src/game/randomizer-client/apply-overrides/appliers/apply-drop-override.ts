/* @layer bridge-wasm @kind logic */
import { setDropOverride } from '../../../drop-overrides';
import { allocateFireId } from '../../override-fire-registry';
import { logOverride } from './log-override';
import type { OverrideApplier } from './override-applier.type';

const applyDropOverride: OverrideApplier = (entry, context) => {
  if (entry.dropOverride === undefined) return;
  const { roomId, big, targetLocalId } = entry.dropOverride;
  setDropOverride({
    roomId,
    big,
    newItem: targetLocalId,
    messageId: context.receiptLineOf(entry.location, targetLocalId),
    fireId: allocateFireId(entry.location),
  });
  logOverride(context.tag, entry, 'ground drop', targetLocalId);
};

export { applyDropOverride };
