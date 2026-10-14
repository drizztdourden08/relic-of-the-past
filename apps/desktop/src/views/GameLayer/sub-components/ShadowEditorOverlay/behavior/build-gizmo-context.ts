/* @layer renderer-components @kind logic */
import type { ToDisplay } from './build-gizmo-context.type';
import type { GizmoContext, GizmoPoint, GizmoScale, GizmoShape } from './gizmo.type';
import { regularPolygonVertices } from './regular-polygon-vertices';

const freehandVertices = (points: GizmoPoint[], center: GizmoPoint, toDisplay: ToDisplay): GizmoPoint[] => {
  const vertices: GizmoPoint[] = [];
  for (const p of points) {
    const dp = toDisplay(p.x, p.y);
    if (dp) {
      vertices.push({ x: dp.x - center.x, y: dp.y - center.y });
    }
  }
  return vertices;
};

const buildGizmoContext = (shape: GizmoShape, scale: GizmoScale, toDisplay: ToDisplay): GizmoContext | null => {
  const { x, y, width, height, rotation, points, sides } = shape;
  const { scaleX, scaleY } = scale;
  const center = toDisplay(x, y);
  if (!center) return null;

  const hw = (width / 2) * scaleX;
  const hh = (height / 2) * scaleY;

  let vertices: GizmoPoint[] | undefined;
  if (points && points.length > 0) {
    vertices = freehandVertices(points, center, toDisplay);
  } else if (sides && sides > 0) {
    vertices = regularPolygonVertices(sides, hw, hh);
  }

  return {
    cx: center.x,
    cy: center.y,
    hw,
    hh,
    rotation: (rotation ?? 0) * Math.PI / 180,
    scaleX,
    scaleY,
    vertices,
    isFreehand: (points?.length ?? 0) > 0,
  };
};

export { buildGizmoContext };
