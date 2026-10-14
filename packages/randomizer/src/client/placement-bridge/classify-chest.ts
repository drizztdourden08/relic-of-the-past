/* @layer bridge-wasm @kind logic */
import type { PlanEntry, PlanError } from '../physical-plan.type';
import type { CheckPlanContext } from './classify-location.type';

const classifyChest = (ctx: CheckPlanContext): PlanEntry | PlanError | null => {
  const { location, item, checkId, detection, targetLocalId, check } = ctx;
  const { kind, gameId } = check;
  if (kind !== 'chest' || gameId.roomId === undefined || gameId.chestIndex === undefined) return null;
  if (detection === null) {
    return { location, item, reason: 'check record has no usable detection' };
  }
  return {
    location, item, checkId, planClass: 'override', detection,
    target: { roomId: gameId.roomId, chestIndex: gameId.chestIndex, targetLocalId },
  };
};

export { classifyChest };
