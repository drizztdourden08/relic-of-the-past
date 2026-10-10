/* @layer renderer-components @kind logic */
import { useShadowEditorStore } from '@app/stores/shadow-editor-store';
import { buildGizmoContext } from './build-gizmo-context';
import { renderGizmo } from './render-gizmo';
import type { GizmoPart } from './gizmo.type';
import { screenIdFromVp } from './screen-id-from-vp';
import { displayToWorld } from './display-to-world';
import { worldToDisplay } from './world-to-display';
import { drawHeightmaps } from './draw-heightmaps';
import { drawLights } from './draw-lights';
import { drawFreehandInProgress } from './draw-freehand-in-progress';
import { DRAG_PREVIEW_MIN_HALF_SIZE } from './overlay.constants';
import type { DrawArgs, Point, ScreenData, Vp } from './overlay.type';

const drawDragPreview = (ctx: CanvasRenderingContext2D, vp: Vp, width: number, height: number, mouseDisplay: Point | null): void => {
  const store = useShadowEditorStore.getState();
  if (!((store.activeTool === 'polygon' || store.activeTool === 'shape-light') && store.isDragging && store.dragStartWorld && mouseDisplay)) return;
  const dragWorld = displayToWorld(vp, width, height, mouseDisplay.x, mouseDisplay.y);
  const startDP = worldToDisplay(vp, width, height, store.dragStartWorld.x, store.dragStartWorld.y);
  const cx = (startDP.x + mouseDisplay.x) / 2, cy = (startDP.y + mouseDisplay.y) / 2;
  const hw = Math.abs(mouseDisplay.x - startDP.x) / 2, hh = Math.abs(mouseDisplay.y - startDP.y) / 2;
  if (hw <= DRAG_PREVIEW_MIN_HALF_SIZE && hh <= DRAG_PREVIEW_MIN_HALF_SIZE) return;
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.translate(cx, cy);
  const sides = store.polygonSides;
  const startAngle = -Math.PI / 2 + (sides % 2 === 0 ? Math.PI / sides : 0);
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 + startAngle;
    if (i === 0) ctx.moveTo(Math.cos(angle) * hw, Math.sin(angle) * hh);
    else ctx.lineTo(Math.cos(angle) * hw, Math.sin(angle) * hh);
  }
  ctx.closePath();
  const isLight = store.activeTool === 'shape-light';
  ctx.fillStyle = isLight ? 'rgba(255, 238, 136, 0.25)' : 'hsla(230, 70%, 50%, 0.3)';
  ctx.fill();
  ctx.strokeStyle = isLight ? '#ffee88' : '#6688ff';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#fff';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  const wWorld = Math.abs(dragWorld.x - store.dragStartWorld.x);
  const hWorld = Math.abs(dragWorld.y - store.dragStartWorld.y);
  ctx.fillText(`${Math.round(wWorld)} × ${Math.round(hWorld)}`, 0, -hh - 8);
  ctx.restore();
};

const drawSelectedGizmo = (ctx: CanvasRenderingContext2D, vp: Vp, width: number, height: number, screenData: ScreenData, hoveredGizmo: GizmoPart | null, activeGizmo: GizmoPart | null): void => {
  const store = useShadowEditorStore.getState();
  if (!(store.activeTool === 'select' && store.selectedElementId && store.selectedType === 'heightmap')) return;
  const el = screenData.heightmap.find((h) => h.id === store.selectedElementId);
  if (!el) return;
  const scaleX = width / vp.snesWidth, scaleY = height / vp.snesHeight;
  const gizmoCtx = buildGizmoContext(
    el.shape.x, el.shape.y, el.shape.width, el.shape.height, el.shape.rotation ?? 0,
    scaleX, scaleY, (wx: number, wy: number) => worldToDisplay(vp, width, height, wx, wy),
    el.shape.points, el.shape.sides,
  );
  if (gizmoCtx) {
    ctx.globalAlpha = 1.0;
    renderGizmo(ctx, gizmoCtx, hoveredGizmo, activeGizmo);
  }
};

const drawOverlay = (ctx: CanvasRenderingContext2D, vp: Vp, a: DrawArgs): void => {
  const screenData = a.getScreenData(screenIdFromVp(vp));
  drawHeightmaps(ctx, vp, a.width, a.height, screenData, a.selectedElementId);
  drawLights(ctx, vp, a.width, a.height, screenData, a.selectedElementId);
  if (a.isDrawingFreehand) drawFreehandInProgress(ctx, vp, a.width, a.height, a.freehandPoints);
  drawDragPreview(ctx, vp, a.width, a.height, a.mouseDisplay);
  drawSelectedGizmo(ctx, vp, a.width, a.height, screenData, a.hoveredGizmo, a.activeGizmo);
  ctx.globalAlpha = 1.0;
};

export { drawOverlay };
