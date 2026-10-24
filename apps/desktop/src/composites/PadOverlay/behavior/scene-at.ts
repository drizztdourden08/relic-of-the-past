/* @layer renderer-components @kind logic */
import { DETAIL_LINE_RATIO, GLYPH_MARGIN, GLYPH_REACH, LABEL_LINE_RATIO } from '../PadOverlay.constants';
import type { FitInput, Scene, Segment } from './placement.type';
import { scaleParts } from './scale-parts';

const sceneAt = (input: FitInput, scale: number): Scene => {
  const { bounds, metrics, mode, raw, points } = input;
  const { width, height, fontPx } = metrics;
  const origin = {
    x: (width - bounds.w * scale) / 2 - bounds.x * scale,
    y: (height - bounds.h * scale) / 2 - bounds.y * scale,
  };
  const parts = scaleParts(raw, { origin, scale });
  const outline = points.map((point) => ({ x: origin.x + point.x * scale, y: origin.y + point.y * scale }));
  const edges = outline.map((point, index): Segment => [point, outline[(index + 1) % outline.length] ?? point]);
  return {
    frame: { width, height, mode, scale, origin, labelH: fontPx * LABEL_LINE_RATIO, lineGap: fontPx * DETAIL_LINE_RATIO },
    parts,
    circles: parts.map((part) => ({ x: part.x, y: part.y, r: part.radius * GLYPH_REACH[part.slot.kind] + GLYPH_MARGIN })),
    outline,
    edges,
    sideEdges: new Map(),
  };
};

export { sceneAt };
