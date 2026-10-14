/* @layer renderer-components @kind logic */
import type { GizmoPoint } from './gizmo.type';

const regularPolygonVertices = (sides: number, hw: number, hh: number): GizmoPoint[] => {
  const startAngle = -Math.PI / 2 + (sides % 2 === 0 ? Math.PI / sides : 0);
  const vertices: GizmoPoint[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 + startAngle;
    vertices.push({ x: Math.cos(angle) * hw, y: Math.sin(angle) * hh });
  }
  return vertices;
};

export { regularPolygonVertices };
