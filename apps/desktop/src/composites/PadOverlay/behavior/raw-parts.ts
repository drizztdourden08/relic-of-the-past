/* @layer renderer-components @kind logic */
import type { ControllerSilhouetteAnchorSet } from '@drizztdourden08/tessera/composites';
import type { OverlaySlotView, PlacedPart } from '../PadOverlay.type';
import { slotFrame } from './slot-frame';

const rawParts = (slots: readonly OverlaySlotView[], anchors: ControllerSilhouetteAnchorSet): PlacedPart[] =>
  slots.flatMap((slot) => {
    const at = slotFrame(slot.anchor, anchors);
    if (!at) return [];
    return [{
      slot,
      x: at.x + (slot.nudge?.dx ?? 0),
      y: at.y + (slot.nudge?.dy ?? 0),
      radius: at.r * (slot.scale ?? 1),
    }];
  });

export { rawParts };
