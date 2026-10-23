/* @layer renderer-components @kind logic */
import type { OverlayAnchor, OverlayBox, OverlaySlotView, PlacedPart } from '../PadOverlay.type';
import { dpadCentre } from './dpad-centre';

const placeParts = (
  slots: readonly OverlaySlotView[], anchors: readonly OverlayAnchor[], box: OverlayBox,
): PlacedPart[] => {
  const byId = new Map<string, OverlayAnchor>(anchors.map((anchor) => [anchor.id, anchor]));
  return slots.flatMap((slot) => {
    const at = slot.kind === 'dpad' ? dpadCentre(byId) : byId.get(slot.anchor);
    if (!at) return [];
    return [{
      slot,
      x: box.gutter + at.x + (slot.nudge?.dx ?? 0),
      y: box.top + at.y + (slot.nudge?.dy ?? 0),
      radius: at.r * (slot.scale ?? 1),
    }];
  });
};

export { placeParts };
