/* @layer renderer-components @kind logic */
import { CENTRE_BAND } from '../PadOverlay.constants';
import type { PlacedPart } from '../PadOverlay.type';
import type { Scene, Zone } from './placement.type';

const partSides = (part: PlacedPart, scene: Scene): Zone[] => {
  const xs = scene.hull.map((point) => point.x);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const centre = (left + right) / 2;
  const band = (right - left) * CENTRE_BAND;
  const sides: Zone[] = [];
  if (part.x < centre + band) sides.push('left');
  if (part.x > centre - band) sides.push('right');
  return sides;
};

export { partSides };
