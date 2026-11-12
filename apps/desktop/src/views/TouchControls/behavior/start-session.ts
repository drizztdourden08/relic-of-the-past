/* @layer renderer-app @kind logic */
import type { OrientationLayout } from '@rotp/features';
import { resolveTouchTarget, toPx } from '@rotp/input-mapping';
import type { PxPoint, ScreenBox } from '@rotp/input-mapping';
import type { TouchSession } from '../TouchControls.type';

const movementBase = (point: PxPoint, layout: OrientationLayout, box: ScreenBox): PxPoint => {
  const { movements, movementType } = layout;
  if (movementType === 'dynamic-stick') return point;
  return toPx(movements[movementType].at, box);
};

const startSession = (point: PxPoint, layout: OrientationLayout, box: ScreenBox, movementTaken: boolean): TouchSession => {
  const target = resolveTouchTarget(point, layout, box);
  if (target.kind === 'button') return { kind: 'button', buttonId: target.id, point };
  if (target.kind === 'movement') {
    return movementTaken ? { kind: 'ignored', point } : { kind: 'movement', base: movementBase(point, layout, box), point };
  }
  return { kind: 'empty', point };
};

export { startSession };
