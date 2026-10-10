/* @layer renderer-components @kind logic */
import type { GizmoHit, GizmoContext } from './gizmo.type';
import {
  AXIS_LEN, ARROW_SIZE, HANDLE_RADIUS, CROSS_SIZE, CROSS_OFFSET, UNIFORM_OFFSET, ROTATE_OFFSET, CENTER_RADIUS,
  VERTEX_RADIUS, DIAGONAL_UNIT, AXIS_HIT_HALF_WIDTH,
} from './gizmo.constants';

const vertexHitOf = (lx: number, ly: number, ctx: GizmoContext): GizmoHit | null => {
  if (!ctx.vertices) return null;
  for (const [i, vertex] of ctx.vertices.entries()) {
    const vx = vertex.x;
    const vy = vertex.y;
    if ((lx - vx) ** 2 + (ly - vy) ** 2 < (VERTEX_RADIUS + 2) ** 2) {
      return { part: `vertex-${i}`, cursor: 'crosshair' };
    }
  }
  return null;
};

const hitTestGizmo = (mouseX: number, mouseY: number, ctx: GizmoContext): GizmoHit | null => {
  const { cx, cy, rotation } = ctx;

  const dx = mouseX - cx;
  const dy = mouseY - cy;
  const cos = Math.cos(-rotation);
  const sin = Math.sin(-rotation);
  const lx = dx * cos - dy * sin;
  const ly = dx * sin + dy * cos;

  if (lx * lx + ly * ly < CENTER_RADIUS * CENTER_RADIUS) {
    return { part: 'move-center', cursor: 'move' };
  }

  const rotX = AXIS_LEN * ROTATE_OFFSET;
  const rotY = 0;
  if ((lx - rotX) ** 2 + (ly - rotY) ** 2 < (HANDLE_RADIUS + 3) ** 2) {
    return { part: 'rotate', cursor: 'grab' };
  }

  const uniX = -AXIS_LEN * UNIFORM_OFFSET * DIAGONAL_UNIT;
  const uniY = -AXIS_LEN * UNIFORM_OFFSET * DIAGONAL_UNIT;
  if ((lx - uniX) ** 2 + (ly - uniY) ** 2 < (HANDLE_RADIUS + 2) ** 2) {
    return { part: 'resize-uniform', cursor: 'nwse-resize' };
  }

  const rxX = AXIS_LEN * CROSS_OFFSET;
  if (Math.abs(lx - rxX) < CROSS_SIZE && Math.abs(ly) < CROSS_SIZE) {
    return { part: 'resize-x', cursor: 'ew-resize' };
  }

  const ryY = -AXIS_LEN * CROSS_OFFSET;
  if (Math.abs(lx) < CROSS_SIZE && Math.abs(ly - ryY) < CROSS_SIZE) {
    return { part: 'resize-y', cursor: 'ns-resize' };
  }

  if (ly > -AXIS_HIT_HALF_WIDTH && ly < AXIS_HIT_HALF_WIDTH && lx > CENTER_RADIUS && lx < AXIS_LEN + ARROW_SIZE) {
    return { part: 'move-x', cursor: 'e-resize' };
  }

  const upAxisTip = -(AXIS_LEN + ARROW_SIZE);
  if (lx > -AXIS_HIT_HALF_WIDTH && lx < AXIS_HIT_HALF_WIDTH && ly < -CENTER_RADIUS && ly > upAxisTip) {
    return { part: 'move-y', cursor: 'n-resize' };
  }

  return vertexHitOf(lx, ly, ctx);
};

export { hitTestGizmo };
