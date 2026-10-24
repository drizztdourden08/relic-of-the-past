/* @layer renderer-components @kind logic */
import { ATTACH_GAP, FRAME_PAD, LABEL_PAD, MIDDLE_REACH, MIDDLE_STEP_RATIO } from '../PadOverlay.constants';
import type { PlacedPart } from '../PadOverlay.type';
import { pointInPolygon } from './point-in-polygon';
import { rectHitsCircle } from './rect-hits-circle';
import { segmentHitsRect } from './segment-hits-rect';
import type { LabelSize, LabelSpot, Rect, Scene } from './placement.type';

const grown = (rect: Rect): Rect => ({ left: rect.left - LABEL_PAD, top: rect.top - LABEL_PAD, right: rect.right + LABEL_PAD, bottom: rect.bottom + LABEL_PAD });

const rectClear = (rect: Rect, scene: Scene): boolean =>
  !scene.circles.some((circle) => rectHitsCircle(grown(rect), circle))
  && !scene.edges.some((edge) => segmentHitsRect(edge, grown(rect)))
  && !pointInPolygon({ x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2 }, scene.outline);

const middleSpots = (part: PlacedPart, size: LabelSize, scene: Scene, fontPx: number): LabelSpot[] => {
  const { w, h } = size;
  const { width, height } = scene.frame;
  const step = fontPx * MIDDLE_STEP_RATIO;
  const spots: LabelSpot[] = [];
  for (let k = -MIDDLE_REACH; k <= MIDDLE_REACH; k += 1) {
    const x = part.x + k * step;
    if (x - w / 2 < FRAME_PAD || x + w / 2 > width - FRAME_PAD) continue;
    for (let y = FRAME_PAD + h / 2; y <= height - FRAME_PAD - h / 2; y += h) {
      const rect = { left: x - w / 2, top: y - h / 2, right: x + w / 2, bottom: y + h / 2 };
      const above = rect.bottom < part.y - part.radius;
      const below = rect.top > part.y + part.radius;
      if ((!above && !below) || !rectClear(rect, scene)) continue;
      const attach = { x, y: above ? rect.bottom + ATTACH_GAP : rect.top - ATTACH_GAP };
      spots.push({ text: { x, y }, anchor: 'middle', rect, attach, middle: true });
    }
  }
  return spots;
};

export { middleSpots };
