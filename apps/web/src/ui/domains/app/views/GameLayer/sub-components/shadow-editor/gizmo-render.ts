/* @layer renderer-components @kind logic */
/** Canvas rendering of the transform gizmo. */
import type { GizmoContext, GizmoPart } from './gizmo-types';
import { AXIS_LEN, ARROW_SIZE, CROSS_SIZE, CROSS_OFFSET, UNIFORM_OFFSET, ROTATE_OFFSET, CENTER_RADIUS, VERTEX_RADIUS, HANDLE_RADIUS } from './gizmo-constants';

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

export { renderGizmo };
