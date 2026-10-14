/* @layer bridge-wasm @kind logic */
import { npcGrantOf } from './npc-grant-of';
import type { PlanEntry, PlanError } from '../physical-plan.type';
import type { CheckPlanContext } from './classify-location.type';

const classifyDeliver = (ctx: CheckPlanContext): PlanEntry | PlanError => {
  const { location, item, checkId, detection, targetLocalId } = ctx;
  if (detection === null) {
    return { location, item, reason: 'check record has no usable detection' };
  }
  const npcGrant = npcGrantOf(checkId);
  return {
    location, item, checkId, planClass: 'deliver', detection, targetLocalId,
    ...(npcGrant !== undefined ? { npcGrant } : {}),
  };
};

export { classifyDeliver };
