/* @layer renderer-components @kind logic */
import { FRAME_PAD, LABEL_GAP, LABEL_PAD } from '../PadOverlay.constants';
import { calloutSpot } from './callout-spot';
import { hullSpan } from './hull-span';
import type { LabelSize, LabelSpot, Scene, Zone } from './placement.type';
import { rectInFrame } from './rect-in-frame';

const sideSpots = (size: LabelSize, scene: Scene, sides: readonly Zone[]): LabelSpot[] => {
  const spots: LabelSpot[] = [];
  const step = (size.up + size.down) / 2;
  for (let y = FRAME_PAD + size.up; y + size.down <= scene.frame.height - FRAME_PAD; y += step) {
    const span = hullSpan(scene, 'y', y - size.up - LABEL_PAD, y + size.down + LABEL_PAD);
    if (!span) continue;
    if (sides.includes('left')) spots.push(calloutSpot({ x: span.low - LABEL_GAP, y }, -1, size, 'left'));
    if (sides.includes('right')) spots.push(calloutSpot({ x: span.high + LABEL_GAP, y }, 1, size, 'right'));
  }
  return spots.filter((spot) => rectInFrame(spot.rect, scene.frame));
};

export { sideSpots };
