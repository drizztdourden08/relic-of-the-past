/* @layer renderer-components @kind logic */
import { DPAD_ARM_IDS } from '../PadOverlay.constants';
import type { AnchorFrame, OverlayAnchor } from '../PadOverlay.type';

const dpadCentre = (byId: ReadonlyMap<string, OverlayAnchor>): AnchorFrame | null => {
  const arms = DPAD_ARM_IDS.flatMap((id) => byId.get(id) ?? []);
  if (arms.length < DPAD_ARM_IDS.length) return null;
  const x = arms.reduce((sum, arm) => sum + arm.x, 0) / arms.length;
  const y = arms.reduce((sum, arm) => sum + arm.y, 0) / arms.length;
  const reach = Math.max(...arms.map((arm) => Math.hypot(arm.x - x, arm.y - y) + arm.r));
  return { x, y, r: reach };
};

export { dpadCentre };
