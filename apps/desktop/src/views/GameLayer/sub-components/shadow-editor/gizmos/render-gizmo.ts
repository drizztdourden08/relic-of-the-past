/* @layer renderer-components @kind logic */
import type { GizmoContext, GizmoPart, IsHighlighted } from './gizmo.type';
import {
  AXIS_LEN, ARROW_SIZE, CROSS_SIZE, CROSS_OFFSET, UNIFORM_OFFSET, ROTATE_OFFSET, CENTER_RADIUS, VERTEX_RADIUS,
  HANDLE_RADIUS, DIAGONAL_UNIT,
} from './gizmo.constants';

const drawAxes = (drawCtx: CanvasRenderingContext2D, highlight: IsHighlighted): void => {
  drawCtx.strokeStyle = highlight('move-x') ? '#ff6666' : '#e03030';
  drawCtx.lineWidth = highlight('move-x') ? 2.5 : 2;
  drawCtx.beginPath();
  drawCtx.moveTo(CENTER_RADIUS, 0);
  drawCtx.lineTo(AXIS_LEN, 0);
  drawCtx.stroke();
  drawCtx.fillStyle = highlight('move-x') ? '#ff6666' : '#e03030';
  drawCtx.beginPath();
  drawCtx.moveTo(AXIS_LEN + ARROW_SIZE, 0);
  drawCtx.lineTo(AXIS_LEN - 2, -4);
  drawCtx.lineTo(AXIS_LEN - 2, 4);
  drawCtx.closePath();
  drawCtx.fill();

  drawCtx.strokeStyle = highlight('move-y') ? '#66ff66' : '#30e030';
  drawCtx.lineWidth = highlight('move-y') ? 2.5 : 2;
  drawCtx.beginPath();
  drawCtx.moveTo(0, -CENTER_RADIUS);
  drawCtx.lineTo(0, -AXIS_LEN);
  drawCtx.stroke();
  drawCtx.fillStyle = highlight('move-y') ? '#66ff66' : '#30e030';
  drawCtx.beginPath();
  drawCtx.moveTo(0, -(AXIS_LEN + ARROW_SIZE));
  drawCtx.lineTo(-4, -(AXIS_LEN - 2));
  drawCtx.lineTo(4, -(AXIS_LEN - 2));
  drawCtx.closePath();
  drawCtx.fill();
};

const drawResizeMarks = (drawCtx: CanvasRenderingContext2D, highlight: IsHighlighted): void => {
  const rxPos = AXIS_LEN * CROSS_OFFSET;
  drawCtx.strokeStyle = highlight('resize-x') ? '#ff8888' : '#e03030';
  drawCtx.lineWidth = highlight('resize-x') ? 2.5 : 1.5;
  drawCtx.beginPath();
  drawCtx.moveTo(rxPos, -CROSS_SIZE);
  drawCtx.lineTo(rxPos, CROSS_SIZE);
  drawCtx.stroke();

  const ryPos = -AXIS_LEN * CROSS_OFFSET;
  drawCtx.strokeStyle = highlight('resize-y') ? '#88ff88' : '#30e030';
  drawCtx.lineWidth = highlight('resize-y') ? 2.5 : 1.5;
  drawCtx.beginPath();
  drawCtx.moveTo(-CROSS_SIZE, ryPos);
  drawCtx.lineTo(CROSS_SIZE, ryPos);
  drawCtx.stroke();

  const uniEnd = AXIS_LEN * UNIFORM_OFFSET * DIAGONAL_UNIT;
  drawCtx.strokeStyle = highlight('resize-uniform') ? '#ffee66' : '#ccaa00';
  drawCtx.lineWidth = highlight('resize-uniform') ? 2.5 : 2;
  drawCtx.beginPath();
  drawCtx.moveTo(-CENTER_RADIUS * DIAGONAL_UNIT, -CENTER_RADIUS * DIAGONAL_UNIT);
  drawCtx.lineTo(-uniEnd, -uniEnd);
  drawCtx.stroke();
  const tAngle = Math.PI * 0.75;
  const tCos = Math.cos(tAngle);
  const tSin = Math.sin(tAngle);
  drawCtx.beginPath();
  drawCtx.moveTo(-uniEnd + tSin * CROSS_SIZE, -uniEnd - tCos * CROSS_SIZE);
  drawCtx.lineTo(-uniEnd - tSin * CROSS_SIZE, -uniEnd + tCos * CROSS_SIZE);
  drawCtx.stroke();
};

const drawRotateAndCenter = (drawCtx: CanvasRenderingContext2D, highlight: IsHighlighted): void => {
  const rotEndX = AXIS_LEN * ROTATE_OFFSET;
  drawCtx.strokeStyle = highlight('rotate') ? '#88ffaa' : '#40cc60';
  drawCtx.lineWidth = highlight('rotate') ? 2 : 1.5;
  drawCtx.setLineDash([3, 3]);
  drawCtx.beginPath();
  drawCtx.moveTo(AXIS_LEN + ARROW_SIZE + 4, 0);
  drawCtx.lineTo(rotEndX - HANDLE_RADIUS, 0);
  drawCtx.stroke();
  drawCtx.setLineDash([]);
  drawCtx.beginPath();
  drawCtx.arc(rotEndX, 0, HANDLE_RADIUS, 0, Math.PI * 2);
  drawCtx.fillStyle = highlight('rotate') ? '#88ffaa' : '#40cc60';
  drawCtx.fill();
  drawCtx.strokeStyle = '#000';
  drawCtx.lineWidth = 1;
  drawCtx.stroke();

  drawCtx.beginPath();
  drawCtx.arc(0, 0, CENTER_RADIUS, 0, Math.PI * 2);
  drawCtx.fillStyle = highlight('move-center') ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)';
  drawCtx.fill();
  drawCtx.strokeStyle = highlight('move-center') ? '#fff' : 'rgba(255,255,255,0.5)';
  drawCtx.lineWidth = 1.5;
  drawCtx.stroke();
};

const drawVertices = (drawCtx: CanvasRenderingContext2D, gizmoCtx: GizmoContext, highlight: IsHighlighted): void => {
  if (!gizmoCtx.vertices) return;
  for (const [i, vertex] of gizmoCtx.vertices.entries()) {
    const vx = vertex.x;
    const vy = vertex.y;
    const isHighlighted = highlight(`vertex-${i}`);
    drawCtx.beginPath();
    drawCtx.arc(vx, vy, isHighlighted ? VERTEX_RADIUS + 2 : VERTEX_RADIUS, 0, Math.PI * 2);
    drawCtx.fillStyle = isHighlighted ? '#ffffff' : 'rgba(255,255,255,0.7)';
    drawCtx.fill();
    drawCtx.strokeStyle = '#000';
    drawCtx.lineWidth = 1;
    drawCtx.stroke();
  }
};

const renderGizmo = (drawCtx: CanvasRenderingContext2D, gizmoCtx: GizmoContext, hoveredPart: GizmoPart | null, activePart: GizmoPart | null): void => {
  const { cx, cy, rotation } = gizmoCtx;

  drawCtx.save();
  drawCtx.translate(cx, cy);
  drawCtx.rotate(rotation);

  const highlight: IsHighlighted = (part) => part === hoveredPart || part === activePart;
  drawAxes(drawCtx, highlight);
  drawResizeMarks(drawCtx, highlight);
  drawRotateAndCenter(drawCtx, highlight);
  drawVertices(drawCtx, gizmoCtx, highlight);

  drawCtx.restore();
};

export { renderGizmo };
