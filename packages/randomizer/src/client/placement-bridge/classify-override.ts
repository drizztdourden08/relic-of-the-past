/* @layer bridge-wasm @kind logic */
import { freestandingKeyDropOf } from '../freestanding-key-drops';
import { npcOverrideKeyOf } from '../npc-override-key';
import { scriptedOverrideKeyOf } from '../scripted-override-key';
import { standingOverrideKeyOf } from '../standing-override-key';
import type { PlanEntry } from '../physical-plan.type';
import type { CheckPlanContext } from './classify-location.type';

const classifyOverride = (ctx: CheckPlanContext): PlanEntry | null => {
  const { location, item, checkId, detectionField, targetLocalId } = ctx;
  const scriptedKey = scriptedOverrideKeyOf(checkId);
  if (scriptedKey !== null) {
    return {
      location, item, checkId, planClass: 'override-scripted', ...detectionField,
      scriptedOverride: { target: scriptedKey, targetLocalId },
    };
  }
  const freestandingKey = freestandingKeyDropOf(checkId);
  if (freestandingKey !== null) {
    return {
      location, item, checkId, planClass: 'override-drop', ...detectionField,
      dropOverride: { ...freestandingKey, targetLocalId },
    };
  }
  const standingKey = standingOverrideKeyOf(checkId);
  if (standingKey !== null) {
    return {
      location, item, checkId, planClass: 'override-standing', ...detectionField,
      standingOverride: { ...standingKey, targetLocalId },
    };
  }
  const npcKey = npcOverrideKeyOf(checkId);
  if (npcKey !== null) {
    return {
      location, item, checkId, planClass: 'override-npc', ...detectionField,
      npcOverride: { ...npcKey, targetLocalId },
    };
  }
  return null;
};

export { classifyOverride };
