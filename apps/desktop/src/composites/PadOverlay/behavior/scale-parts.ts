/* @layer renderer-components @kind logic */
import type { PlacedPart, Point } from '../PadOverlay.type';

const scaleParts = (parts: readonly PlacedPart[], at: { origin: Point; scale: number }): PlacedPart[] =>
  parts.map((part) => ({
    slot: part.slot,
    x: at.origin.x + part.x * at.scale,
    y: at.origin.y + part.y * at.scale,
    radius: part.radius * at.scale,
  }));

export { scaleParts };
