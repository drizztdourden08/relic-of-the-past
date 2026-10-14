/* @layer bridge-wasm @kind logic */
import { setStandingOverride } from '../../../standing-overrides';
import { allocateFireId } from '../../override-fire-registry';
import { logOverride } from './log-override';
import type { OverrideApplier } from './override-applier.type';

const applyStandingOverride: OverrideApplier = (entry, context) => {
  if (entry.standingOverride === undefined) return;
  const { targetLocalId, ...target } = entry.standingOverride;
  setStandingOverride(target, targetLocalId, context.receiptLineOf(entry.location, targetLocalId), allocateFireId(entry.location));
  logOverride(context.tag, entry, 'standing prize', targetLocalId);
};

export { applyStandingOverride };
