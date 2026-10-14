/* @layer bridge-wasm @kind logic */
import { isBigKeyDrop } from '../key-drop-size';
import type { PlanEntry } from '../physical-plan.type';
import type { CheckPlanContext } from './classify-location.type';

const classifyKeyDrop = (ctx: CheckPlanContext): PlanEntry | null => {
  const { location, item, checkId, detectionField, targetLocalId, check } = ctx;
  const { kind, gameId } = check;
  if (kind !== 'keyDrop' || gameId.roomId === undefined) return null;
  const big = isBigKeyDrop(checkId);
  return {
    location, item, checkId, planClass: 'override-drop', ...detectionField,
    dropOverride: { roomId: gameId.roomId, big, targetLocalId },
  };
};

export { classifyKeyDrop };
