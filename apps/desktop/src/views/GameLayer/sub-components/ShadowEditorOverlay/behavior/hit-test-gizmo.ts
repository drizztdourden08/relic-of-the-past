/* @layer renderer-components @kind logic */
import type { GizmoHit, GizmoContext } from './gizmo.type';
import type { GizmoCheck } from './hit-test-gizmo.type';
import {
  AXIS_LEN, ARROW_SIZE, HANDLE_RADIUS, CROSS_SIZE, CROSS_OFFSET, UNIFORM_OFFSET, ROTATE_OFFSET, CENTER_RADIUS,
  VERTEX_RADIUS, DIAGONAL_UNIT, AXIS_HIT_HALF_WIDTH,
} from './gizmo.constants';

const centerHit: GizmoCheck = ({ lx, ly }) => (
  lx * lx + ly * ly < CENTER_RADIUS * CENTER_RADIUS ? { part: 'move-center', cursor: 'move' } : null
);

const rotateHit: GizmoCheck = ({ lx, ly }) => {
  const rotX = AXIS_LEN * ROTATE_OFFSET;
  const rotY = 0;
  return (lx - rotX) ** 2 + (ly - rotY) ** 2 < (HANDLE_RADIUS + 3) ** 2 ? { part: 'rotate', cursor: 'grab' } : null;
};

const uniformHit: GizmoCheck = ({ lx, ly }) => {
  const uniX = -AXIS_LEN * UNIFORM_OFFSET * DIAGONAL_UNIT;
  const uniY = -AXIS_LEN * UNIFORM_OFFSET * DIAGONAL_UNIT;
  return (lx - uniX) ** 2 + (ly - uniY) ** 2 < (HANDLE_RADIUS + 2) ** 2 ? { part: 'resize-uniform', cursor: 'nwse-resize' } : null;
};

const resizeXHit: GizmoCheck = ({ lx, ly }) => {
  const rxX = AXIS_LEN * CROSS_OFFSET;
  return Math.abs(lx - rxX) < CROSS_SIZE && Math.abs(ly) < CROSS_SIZE ? { part: 'resize-x', cursor: 'ew-resize' } : null;
};

const resizeYHit: GizmoCheck = ({ lx, ly }) => {
  const ryY = -AXIS_LEN * CROSS_OFFSET;
  return Math.abs(lx) < CROSS_SIZE && Math.abs(ly - ryY) < CROSS_SIZE ? { part: 'resize-y', cursor: 'ns-resize' } : null;
};

const moveXHit: GizmoCheck = ({ lx, ly }) => (
  ly > -AXIS_HIT_HALF_WIDTH && ly < AXIS_HIT_HALF_WIDTH && lx > CENTER_RADIUS && lx < AXIS_LEN + ARROW_SIZE
    ? { part: 'move-x', cursor: 'e-resize' }
    : null
);

const moveYHit: GizmoCheck = ({ lx, ly }) => {
  const upAxisTip = -(AXIS_LEN + ARROW_SIZE);
  return lx > -AXIS_HIT_HALF_WIDTH && lx < AXIS_HIT_HALF_WIDTH && ly < -CENTER_RADIUS && ly > upAxisTip
    ? { part: 'move-y', cursor: 'n-resize' }
    : null;
};

const vertexHit: GizmoCheck = ({ lx, ly }, ctx) => {
  if (!ctx.vertices) return null;
  for (const [i, vertex] of ctx.vertices.entries()) {
    if ((lx - vertex.x) ** 2 + (ly - vertex.y) ** 2 < (VERTEX_RADIUS + 2) ** 2) {
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
  const local = { lx: dx * cos - dy * sin, ly: dx * sin + dy * cos };

  const checks: readonly GizmoCheck[] = [centerHit, rotateHit, uniformHit, resizeXHit, resizeYHit, moveXHit, moveYHit, vertexHit];
  for (const check of checks) {
    const hit = check(local, ctx);
    if (hit) return hit;
  }
  return null;
};

export { hitTestGizmo };
