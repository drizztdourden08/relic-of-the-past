/* @layer renderer-components @kind logic */
/**
 * Gizmo system for the shadow editor.
 * Handles rendering, hit testing, and interaction for transform gizmos.
 *
 * Gizmo parts:
 * - move-x / move-y: Axis arrows (red/green) — drag to move along axis
 * - move-center: Cross joint between axes — drag to move freely
 * - resize-x / resize-y: Cross marks on axes — drag to stretch in that direction
 * - resize-uniform: Diagonal line (yellow) — drag to resize both axes
 * - rotate: Green line from center to right with circle handle
 * - vertex-N: Vertex points on freehand/polygon shapes
 * - radius-N: Yellow circle handles on vertices for corner radius
 */

type GizmoPart =
  | 'move-x'
  | 'move-y'
  | 'move-center'
  | 'resize-x'
  | 'resize-y'
  | 'resize-uniform'
  | 'rotate'
  | `vertex-${number}`
  | `radius-${number}`;

interface GizmoHit {
  part: GizmoPart;
  cursor: string;
}

interface GizmoContext {
  /** Center of the shape in display coordinates */
  cx: number;
  cy: number;
  /** Half-width/height in display coordinates */
  hw: number;
  hh: number;
  /** Shape rotation in radians */
  rotation: number;
  /** Scale from SNES to display px */
  scaleX: number;
  scaleY: number;
  /** Vertex points in display coordinates (relative to center) */
  vertices?: { x: number; y: number }[];
  /** Whether the shape is freehand (has editable vertices) */
  isFreehand: boolean;
}

// Gizmo geometry constants
const AXIS_LEN = 48;           // Length of axis arrows in px
const ARROW_SIZE = 8;          // Arrow head size
const HANDLE_RADIUS = 5;       // Hit radius for handles
const CROSS_SIZE = 8;          // Cross mark size on axes
const CROSS_OFFSET = 0.55;     // Position of resize cross along axis (0–1)
const UNIFORM_OFFSET = 0.7;    // Position of uniform resize on diagonal
const ROTATE_OFFSET = 1.3;     // Rotation handle distance (multiplier of AXIS_LEN)
const CENTER_RADIUS = 7;       // Center move handle size
const VERTEX_RADIUS = 4;       // Vertex point radius
const RADIUS_HANDLE_DIST = 16; // Distance from vertex to radius handle

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

const renderGizmo = (drawCtx: CanvasRenderingContext2D, gizmoCtx: GizmoContext, hoveredPart: GizmoPart | null, activePart: GizmoPart | null): void => {
  const { cx, cy, rotation } = gizmoCtx;

  drawCtx.save();
  drawCtx.translate(cx, cy);
  drawCtx.rotate(rotation);

  const highlight = (part: GizmoPart) => part === hoveredPart || part === activePart;

  // ─── X axis (red) ───
  drawCtx.strokeStyle = highlight('move-x') ? '#ff6666' : '#e03030';
  drawCtx.lineWidth = highlight('move-x') ? 2.5 : 2;
  drawCtx.beginPath();
  drawCtx.moveTo(CENTER_RADIUS, 0);
  drawCtx.lineTo(AXIS_LEN, 0);
  drawCtx.stroke();
  // Arrow head
  drawCtx.fillStyle = highlight('move-x') ? '#ff6666' : '#e03030';
  drawCtx.beginPath();
  drawCtx.moveTo(AXIS_LEN + ARROW_SIZE, 0);
  drawCtx.lineTo(AXIS_LEN - 2, -4);
  drawCtx.lineTo(AXIS_LEN - 2, 4);
  drawCtx.closePath();
  drawCtx.fill();

  // ─── Y axis (green, going UP) ───
  drawCtx.strokeStyle = highlight('move-y') ? '#66ff66' : '#30e030';
  drawCtx.lineWidth = highlight('move-y') ? 2.5 : 2;
  drawCtx.beginPath();
  drawCtx.moveTo(0, -CENTER_RADIUS);
  drawCtx.lineTo(0, -AXIS_LEN);
  drawCtx.stroke();
  // Arrow head
  drawCtx.fillStyle = highlight('move-y') ? '#66ff66' : '#30e030';
  drawCtx.beginPath();
  drawCtx.moveTo(0, -(AXIS_LEN + ARROW_SIZE));
  drawCtx.lineTo(-4, -(AXIS_LEN - 2));
  drawCtx.lineTo(4, -(AXIS_LEN - 2));
  drawCtx.closePath();
  drawCtx.fill();

  // ─── Resize-X cross mark ───
  const rxPos = AXIS_LEN * CROSS_OFFSET;
  drawCtx.strokeStyle = highlight('resize-x') ? '#ff8888' : '#e03030';
  drawCtx.lineWidth = highlight('resize-x') ? 2.5 : 1.5;
  drawCtx.beginPath();
  drawCtx.moveTo(rxPos, -CROSS_SIZE);
  drawCtx.lineTo(rxPos, CROSS_SIZE);
  drawCtx.stroke();

  // ─── Resize-Y cross mark ───
  const ryPos = -AXIS_LEN * CROSS_OFFSET;
  drawCtx.strokeStyle = highlight('resize-y') ? '#88ff88' : '#30e030';
  drawCtx.lineWidth = highlight('resize-y') ? 2.5 : 1.5;
  drawCtx.beginPath();
  drawCtx.moveTo(-CROSS_SIZE, ryPos);
  drawCtx.lineTo(CROSS_SIZE, ryPos);
  drawCtx.stroke();

  // ─── Uniform resize diagonal (yellow, upper-left) ───
  const uniEnd = AXIS_LEN * UNIFORM_OFFSET * 0.707;
  drawCtx.strokeStyle = highlight('resize-uniform') ? '#ffee66' : '#ccaa00';
  drawCtx.lineWidth = highlight('resize-uniform') ? 2.5 : 2;
  drawCtx.beginPath();
  drawCtx.moveTo(-CENTER_RADIUS * 0.707, -CENTER_RADIUS * 0.707);
  drawCtx.lineTo(-uniEnd, -uniEnd);
  drawCtx.stroke();
  // T-mark at end
  const tAngle = Math.PI * 0.75; // 135 degrees
  const tCos = Math.cos(tAngle);
  const tSin = Math.sin(tAngle);
  drawCtx.beginPath();
  drawCtx.moveTo(-uniEnd + tSin * CROSS_SIZE, -uniEnd - tCos * CROSS_SIZE);
  drawCtx.lineTo(-uniEnd - tSin * CROSS_SIZE, -uniEnd + tCos * CROSS_SIZE);
  drawCtx.stroke();

  // ─── Rotation handle (green line to the right, with circle) ───
  const rotEndX = AXIS_LEN * ROTATE_OFFSET;
  drawCtx.strokeStyle = highlight('rotate') ? '#88ffaa' : '#40cc60';
  drawCtx.lineWidth = highlight('rotate') ? 2 : 1.5;
  drawCtx.setLineDash([3, 3]);
  drawCtx.beginPath();
  drawCtx.moveTo(AXIS_LEN + ARROW_SIZE + 4, 0);
  drawCtx.lineTo(rotEndX - HANDLE_RADIUS, 0);
  drawCtx.stroke();
  drawCtx.setLineDash([]);
  // Circle handle
  drawCtx.beginPath();
  drawCtx.arc(rotEndX, 0, HANDLE_RADIUS, 0, Math.PI * 2);
  drawCtx.fillStyle = highlight('rotate') ? '#88ffaa' : '#40cc60';
  drawCtx.fill();
  drawCtx.strokeStyle = '#000';
  drawCtx.lineWidth = 1;
  drawCtx.stroke();

  // ─── Center joint ───
  drawCtx.beginPath();
  drawCtx.arc(0, 0, CENTER_RADIUS, 0, Math.PI * 2);
  drawCtx.fillStyle = highlight('move-center') ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)';
  drawCtx.fill();
  drawCtx.strokeStyle = highlight('move-center') ? '#fff' : 'rgba(255,255,255,0.5)';
  drawCtx.lineWidth = 1.5;
  drawCtx.stroke();

  // ─── Vertex points ───
  if (gizmoCtx.vertices) {
    for (let i = 0; i < gizmoCtx.vertices.length; i++) {
      const vx = gizmoCtx.vertices[i].x;
      const vy = gizmoCtx.vertices[i].y;
      const isHighlighted = highlight(`vertex-${i}` as GizmoPart);
      drawCtx.beginPath();
      drawCtx.arc(vx, vy, isHighlighted ? VERTEX_RADIUS + 2 : VERTEX_RADIUS, 0, Math.PI * 2);
      drawCtx.fillStyle = isHighlighted ? '#ffffff' : 'rgba(255,255,255,0.7)';
      drawCtx.fill();
      drawCtx.strokeStyle = '#000';
      drawCtx.lineWidth = 1;
      drawCtx.stroke();
    }
  }

  drawCtx.restore();
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

const getGizmoCursor = (part: GizmoPart | null): string => {
  if (!part) return 'default';
  const hit = CURSOR_MAP[part];
  return hit ?? 'default';
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

export { hitTestGizmo, renderGizmo, buildGizmoContext, getGizmoCursor };
export type { GizmoPart, GizmoHit };
