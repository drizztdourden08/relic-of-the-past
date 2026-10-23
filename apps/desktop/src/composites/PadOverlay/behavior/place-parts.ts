/* @layer renderer-components @kind logic */
import type { ControllerSilhouetteAnchorSet } from '@drizztdourden08/tessera/composites';
import type { OverlayBox, OverlaySlotView, PlacedPart } from '../PadOverlay.type';
import { slotFrame } from './slot-frame';

const placeParts = (
  slots: readonly OverlaySlotView[], anchors: ControllerSilhouetteAnchorSet, box: OverlayBox,
): PlacedPart[] =>
  slots.flatMap((slot) => {
    const at = slotFrame(slot.anchor, anchors);
    if (!at) return [];
    return [{
      slot,
      x: box.gutter + at.x + (slot.nudge?.dx ?? 0),
      y: box.top + at.y + (slot.nudge?.dy ?? 0),
      radius: at.r * (slot.scale ?? 1),
    }];
  });

export { placeParts };
