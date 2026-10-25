/* @layer renderer-components @kind logic */
import { END_REACH, END_ROWS, END_STEP_RATIO, LABEL_GAP, LABEL_PAD, TOWARDS } from '../PadOverlay.constants';
import type { PlacedPart } from '../PadOverlay.type';
import { calloutSpot } from './callout-spot';
import { hullSpan } from './hull-span';
import type { LabelSize, LabelSpot, Scene, Toward } from './placement.type';
import { rectInFrame } from './rect-in-frame';

const columnSpots = (x: number, toward: Toward, size: LabelSize, scene: Scene): LabelSpot[] => {
  const probe = calloutSpot({ x, y: 0 }, toward, size, 'below').rect;
  const span = hullSpan(scene, 'x', probe.left - LABEL_PAD, probe.right + LABEL_PAD);
  if (!span) return [];
  const rowStep = size.up + size.down + LABEL_PAD;
  return Array.from({ length: END_ROWS }, (_, row) => row * rowStep).flatMap((lift) => [
    calloutSpot({ x, y: span.high + LABEL_GAP + size.up + lift }, toward, size, 'below'),
    calloutSpot({ x, y: span.low - LABEL_GAP - size.down - lift }, toward, size, 'above'),
  ]);
};

const endSpots = (part: PlacedPart, size: LabelSize, scene: Scene, fontPx: number): LabelSpot[] => {
  const step = fontPx * END_STEP_RATIO;
  const spots: LabelSpot[] = [];
  for (let k = -END_REACH; k <= END_REACH; k += 1) {
    for (const toward of TOWARDS) spots.push(...columnSpots(part.x + k * step, toward, size, scene));
  }
  return spots.filter((spot) => rectInFrame(spot.rect, scene.frame));
};

export { endSpots };
