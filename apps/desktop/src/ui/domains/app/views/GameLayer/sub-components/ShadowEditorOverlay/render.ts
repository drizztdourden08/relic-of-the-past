/* @layer renderer-components @kind logic */
import { useShadowEditorStore } from '../../../../../../../stores/shadow-editor-store';
import { buildGizmoContext, renderGizmo } from '../shadow-editor/gizmos';
import type { GizmoPart } from '../shadow-editor/gizmos';
import { screenIdFromVp, displayToWorld, worldToDisplay } from './coords';
import type { Vp, Point } from './coords';
import type { ScreenData } from './hittest';
import { drawHeightmaps, drawLights, drawFreehandInProgress } from './render-elements';

interface DrawArgs {
  width: number;
  height: number;
  selectedElementId: string | null;
  freehandPoints: Point[];
  isDrawingFreehand: boolean;
  hoveredGizmo: GizmoPart | null;
  activeGizmo: GizmoPart | null;
  mouseDisplay: Point | null;
  getScreenData: (screenId: number) => ScreenData;
}

const drawDragPreview = (ctx: CanvasRenderingContext2D, vp: Vp, width: number, height: number, mouseDisplay: Point | null): void => {
  const store = useShadowEditorStore.getState();
  if (!((store.activeTool === 'polygon' || store.activeTool === 'shape-light') && store.isDragging && store.dragStartWorld && mouseDisplay)) return;
  const dragWorld = displayToWorld(vp, width, height, mouseDisplay.x, mouseDisplay.y);
  const startDP = worldToDisplay(vp, width, height, store.dragStartWorld.x, store.dragStartWorld.y);
  const cx = (startDP.x + mouseDisplay.x) / 2, cy = (startDP.y + mouseDisplay.y) / 2;
  const hw = Math.abs(mouseDisplay.x - startDP.x) / 2, hh = Math.abs(mouseDisplay.y - startDP.y) / 2;
  if (hw <= 2 && hh <= 2) return;
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

/** Draw the full editor overlay for the current frame. Caller guarantees vp is
 *  valid, the location is the overworld, and preview mode is off. */
const drawOverlay = (ctx: CanvasRenderingContext2D, vp: Vp, a: DrawArgs): void => {
  const screenData = a.getScreenData(screenIdFromVp(vp));
  drawHeightmaps(ctx, vp, a.width, a.height, screenData, a.selectedElementId);
  drawLights(ctx, vp, a.width, a.height, screenData, a.selectedElementId);
  if (a.isDrawingFreehand) drawFreehandInProgress(ctx, vp, a.width, a.height, a.freehandPoints);
  drawDragPreview(ctx, vp, a.width, a.height, a.mouseDisplay);
  drawSelectedGizmo(ctx, vp, a.width, a.height, screenData, a.hoveredGizmo, a.activeGizmo);
  ctx.globalAlpha = 1.0;
};

export type { DrawArgs };
export { drawOverlay };
