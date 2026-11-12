/* @layer renderer-app @kind logic */
import type { OrientationLayout } from '@rotp/features';
import { resolveTouchTarget } from '@rotp/input-mapping';
import type { PxPoint, ScreenBox } from '@rotp/input-mapping';
import type { TouchSession } from '../TouchControls.type';

const moveSession = (session: TouchSession, point: PxPoint, layout: OrientationLayout, box: ScreenBox): boolean => {
  session.point = point;
  if (session.kind !== 'button') return false;
  const target = resolveTouchTarget(point, layout, box);
  const next = target.kind === 'button' ? target.id : null;
  if (next === session.buttonId) return false;
  session.buttonId = next;
  return next !== null;
};

export { moveSession };
