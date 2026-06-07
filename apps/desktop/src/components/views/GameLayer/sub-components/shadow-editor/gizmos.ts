/* @layer renderer-components @kind logic */
/**
 * Gizmo system for the shadow editor — hit testing + context building + cursor.
 * Rendering lives in gizmo-render.ts; types in gizmo-types.ts; geometry constants
 * in gizmo-constants.ts. Public barrel re-exports them all.
 */
import type { GizmoPart, GizmoHit, GizmoContext } from './gizmo-types';
import { AXIS_LEN, ARROW_SIZE, HANDLE_RADIUS, CROSS_SIZE, CROSS_OFFSET, UNIFORM_OFFSET, ROTATE_OFFSET, CENTER_RADIUS, VERTEX_RADIUS } from './gizmo-constants';
import { renderGizmo } from './gizmo-render';

const hitTestGizmo = (mouseX: number, mouseY: number, ctx: GizmoContext): GizmoHit | null => {
  const { cx, cy, rotation } = ctx;

  // Transform mouse into gizmo-local space (undo rotation)
  const dx = mouseX - cx;
  const dy = mouseY - cy;
  const cos = Math.cos(-rotation);
  const sin = Math.sin(-rotation);
  const lx = dx * cos - dy * sin;
  const ly = dx * sin + dy * cos;

  // ─── Center (move freely) ───
  if (lx * lx + ly * ly < CENTER_RADIUS * CENTER_RADIUS) {
    return { part: 'move-center', cursor: 'move' };
  }

  // ─── Rotation handle ───
  const rotX = AXIS_LEN * ROTATE_OFFSET;
  const rotY = 0;
  if ((lx - rotX) ** 2 + (ly - rotY) ** 2 < (HANDLE_RADIUS + 3) ** 2) {
    return { part: 'rotate', cursor: 'grab' };
  }

  // ─── Resize uniform (diagonal, upper-left direction: -X, -Y) ───
  const uniX = -AXIS_LEN * UNIFORM_OFFSET * 0.707;
  const uniY = -AXIS_LEN * UNIFORM_OFFSET * 0.707;
  if ((lx - uniX) ** 2 + (ly - uniY) ** 2 < (HANDLE_RADIUS + 2) ** 2) {
    return { part: 'resize-uniform', cursor: 'nwse-resize' };
  }

  // ─── Resize-X (cross mark on X axis) ───
  const rxX = AXIS_LEN * CROSS_OFFSET;
  if (Math.abs(lx - rxX) < CROSS_SIZE && Math.abs(ly) < CROSS_SIZE) {
    return { part: 'resize-x', cursor: 'ew-resize' };
  }

  // ─── Resize-Y (cross mark on Y axis) ───
  const ryY = -AXIS_LEN * CROSS_OFFSET;
  if (Math.abs(lx) < CROSS_SIZE && Math.abs(ly - ryY) < CROSS_SIZE) {
    return { part: 'resize-y', cursor: 'ns-resize' };
  }

  // ─── Move-X (along X axis arrow) ───
  if (ly > -6 && ly < 6 && lx > CENTER_RADIUS && lx < AXIS_LEN + ARROW_SIZE) {
    return { part: 'move-x', cursor: 'e-resize' };
  }

  // ─── Move-Y (along Y axis arrow, going UP) ───
  if (lx > -6 && lx < 6 && ly < -CENTER_RADIUS && ly > -(AXIS_LEN + ARROW_SIZE)) {
    return { part: 'move-y', cursor: 'n-resize' };
  }

  // ─── Vertex points ───
  if (ctx.vertices) {
    for (let i = 0; i < ctx.vertices.length; i++) {
      const vx = ctx.vertices[i].x;
      const vy = ctx.vertices[i].y;
      // Vertices are stored in the same local-unrotated space as lx/ly
      if ((lx - vx) ** 2 + (ly - vy) ** 2 < (VERTEX_RADIUS + 2) ** 2) {
        return { part: `vertex-${i}`, cursor: 'crosshair' };
      }
    }
  }

  return null;
};

const buildGizmoContext = (shapeX: number, shapeY: number, shapeWidth: number, shapeHeight: number, rotation: number, scaleX: number, scaleY: number, worldToDisplay: (wx: number, wy: number) => { x: number; y: number } | null, points?: { x: number; y: number }[], sides?: number): GizmoContext | null => {
  const center = worldToDisplay(shapeX, shapeY);
  if (!center) return null;

  const hw = (shapeWidth / 2) * scaleX;
  const hh = (shapeHeight / 2) * scaleY;

  let vertices: { x: number; y: number }[] | undefined;
  if (points && points.length > 0) {
    // Freehand — explicit vertex positions
    vertices = [];
    for (const p of points) {
      const dp = worldToDisplay(p.x, p.y);
      if (dp) {
        vertices.push({ x: dp.x - center.x, y: dp.y - center.y });
      }
    }
  } else if (sides && sides > 0) {
    // Regular polygon — compute vertex positions in display-local coords
    const startAngle = -Math.PI / 2 + (sides % 2 === 0 ? Math.PI / sides : 0);
    vertices = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2 + startAngle;
      vertices.push({ x: Math.cos(angle) * hw, y: Math.sin(angle) * hh });
    }
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
    isFreehand: !!points && points.length > 0,
  };
};

const CURSOR_MAP: Record<string, string> = {
  'move-x': 'e-resize',
  'move-y': 'n-resize',
  'move-center': 'move',
  'resize-x': 'ew-resize',
  'resize-y': 'ns-resize',
  'resize-uniform': 'nwse-resize',
  'rotate': 'grab',
};

const getGizmoCursor = (part: GizmoPart | null): string => {
  if (!part) return 'default';
  const hit = CURSOR_MAP[part];
  return hit ?? 'default';
};

export { hitTestGizmo, renderGizmo, buildGizmoContext, getGizmoCursor };
export type { GizmoPart, GizmoHit, GizmoContext } from './gizmo-types';
