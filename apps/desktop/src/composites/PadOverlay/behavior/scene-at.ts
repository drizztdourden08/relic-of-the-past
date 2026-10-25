/* @layer renderer-components @kind logic */
import { FRAME_PAD, GLYPH_MARGIN, GLYPH_REACH } from '../PadOverlay.constants';
import type { Point } from '../PadOverlay.type';
import { circlePoints } from './circle-points';
import { convexHull } from './convex-hull';
import type { FitInput, GrowRows, Scene, Segment } from './placement.type';
import { scaleParts } from './scale-parts';

const edgesOf = (polygon: readonly Point[]): Segment[] =>
  polygon.map((point, index): Segment => [point, polygon[(index + 1) % polygon.length] ?? point]);

const sceneAt = (input: FitInput, scale: number, grow: GrowRows): Scene => {
  const { bounds, metrics, raw, points, rowH } = input;
  const content = bounds.h * scale + (grow.top + grow.bottom) * rowH;
  const height = Math.max(metrics.height, Math.ceil(content + FRAME_PAD * 2));
  const origin = {
    x: (metrics.width - bounds.w * scale) / 2 - bounds.x * scale,
    y: (height - content) / 2 + grow.top * rowH - bounds.y * scale,
  };
  const parts = scaleParts(raw, { origin, scale });
  const circles = parts.map((part) => ({ x: part.x, y: part.y, r: part.radius * GLYPH_REACH[part.slot.kind] + GLYPH_MARGIN }));
  const outline = points.map((point) => ({ x: origin.x + point.x * scale, y: origin.y + point.y * scale }));
  const hull = convexHull([...outline, ...circles.flatMap(circlePoints)]);
  return {
    frame: { width: metrics.width, height, scale, origin },
    parts,
    circles,
    outline,
    outlineEdges: edgesOf(outline),
    hull,
    hullEdges: edgesOf(hull),
    spans: new Map(),
  };
};

export { sceneAt };
