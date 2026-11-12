/* @layer renderer-app @kind logic */
import type { OrientationLayout } from '@rotp/features';
import { movementRadiusPx, resolveTouchTarget, toPx } from '@rotp/input-mapping';
import type { PxPoint, ScreenBox } from '@rotp/input-mapping';
import type { TouchSession } from '../TouchControls.type';
import { clampStickBase } from './clamp-stick-base';

const movementBase = (point: PxPoint, layout: OrientationLayout, box: ScreenBox): PxPoint => {
  const { movements, movementType } = layout;
  if (movementType === 'dynamic-stick') {
    return clampStickBase(point, movements['dynamic-stick'].zone, movementRadiusPx(layout, box), box);
  }
  return toPx(movements[movementType].at, box);
};

/** The session a finger starts with. Only one finger drives movement at a time. */
const startSession = (point: PxPoint, layout: OrientationLayout, box: ScreenBox, movementTaken: boolean): TouchSession => {
  const target = resolveTouchTarget(point, layout, box);
  if (target.kind === 'button') return { kind: 'button', buttonId: target.id, point };
  if (target.kind === 'movement') {
    return movementTaken ? { kind: 'ignored', point } : { kind: 'movement', base: movementBase(point, layout, box), point };
  }
  return { kind: 'empty', point };
};

/** Follows a finger. A button finger rolls onto the button under it, or releases when over none. Returns true when it newly pressed a button. */
const moveSession = (session: TouchSession, point: PxPoint, layout: OrientationLayout, box: ScreenBox): boolean => {
  session.point = point;
  if (session.kind !== 'button') return false;
  const target = resolveTouchTarget(point, layout, box);
  const next = target.kind === 'button' ? target.id : null;
  if (next === session.buttonId) return false;
  session.buttonId = next;
  return next !== null;
};

export { moveSession, startSession };
