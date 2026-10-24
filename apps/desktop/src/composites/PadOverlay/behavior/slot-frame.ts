/* @layer renderer-components @kind logic */
import type { ControllerSilhouetteAnchorSet } from '@drizztdourden08/tessera/composites';
import type { ControllerSlotId } from '@drizztdourden08/brock-input/renderer';
import type { AnchorFrame } from '../PadOverlay.type';
import { FACE_BEARINGS, FACE_BUTTON_RATIO, SLOT_ANCHOR_ID, UNSIZED_RADIUS } from './slot-anchors.constants';

const slotFrame = (slotId: ControllerSlotId, anchors: ControllerSilhouetteAnchorSet): AnchorFrame | null => {
  const anchorId = SLOT_ANCHOR_ID[slotId];
  const anchor = anchors[anchorId];
  if (!anchor) return null;
  const bearing = FACE_BEARINGS[slotId];
  if (!bearing) return { x: anchor.x, y: anchor.y, r: anchor.r ?? UNSIZED_RADIUS[anchorId] ?? 0 };
  const radius = (anchor.r ?? 0) * FACE_BUTTON_RATIO;
  const reach = (anchor.r ?? 0) - radius;
  return { x: anchor.x + bearing.x * reach, y: anchor.y + bearing.y * reach, r: radius };
};

export { slotFrame };
