/* @layer renderer-components @kind logic */
import type { GizmoContext, GizmoPoint } from './gizmo.type';

const freehandVertices = (
  points: GizmoPoint[], center: GizmoPoint, worldToDisplay: (wx: number, wy: number) => GizmoPoint | null,
): GizmoPoint[] => {
  const vertices: GizmoPoint[] = [];
  for (const p of points) {
    const dp = worldToDisplay(p.x, p.y);
    if (dp) {
      vertices.push({ x: dp.x - center.x, y: dp.y - center.y });
    }
  }
  return vertices;
};

const regularPolygonVertices = (sides: number, hw: number, hh: number): GizmoPoint[] => {
  const startAngle = -Math.PI / 2 + (sides % 2 === 0 ? Math.PI / sides : 0);
  const vertices: GizmoPoint[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 + startAngle;
    vertices.push({ x: Math.cos(angle) * hw, y: Math.sin(angle) * hh });
  }
  return vertices;
};

const buildGizmoContext = (shapeX: number, shapeY: number, shapeWidth: number, shapeHeight: number, rotation: number, scaleX: number, scaleY: number, worldToDisplay: (wx: number, wy: number) => GizmoPoint | null, points?: GizmoPoint[], sides?: number): GizmoContext | null => {
  const center = worldToDisplay(shapeX, shapeY);
  if (!center) return null;

  const hw = (shapeWidth / 2) * scaleX;
  const hh = (shapeHeight / 2) * scaleY;

  let vertices: GizmoPoint[] | undefined;
  if (points && points.length > 0) {
    vertices = freehandVertices(points, center, worldToDisplay);
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
    isFreehand: Boolean(points) && points.length > 0,
  };
};

export { buildGizmoContext };
