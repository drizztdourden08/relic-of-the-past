/* @layer bridge-wasm @kind logic */
import { setScriptedGrantOverride } from '../../../scripted-grant-overrides';
import { allocateFireId } from '../../override-fire-registry';
import { logOverride } from './log-override';
import type { OverrideApplier } from './override-applier.type';

const applyScriptedOverride: OverrideApplier = (entry, context) => {
  if (entry.scriptedOverride === undefined) return;
  const { target, targetLocalId } = entry.scriptedOverride;
  const armedWithEveryPondRung = target.surface === 'wish-pond';
  if (armedWithEveryPondRung) return;
  setScriptedGrantOverride(target, targetLocalId, context.receiptLineOf(entry.location, targetLocalId), allocateFireId(entry.location));
  logOverride(context.tag, entry, 'scripted grant', targetLocalId);
};

export { applyScriptedOverride };
