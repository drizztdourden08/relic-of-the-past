/* @layer renderer-components @kind logic */
import { useShadowEditorStore } from '@app/stores/shadow-editor-store';
import { gizmoContextForElement } from './gizmo-context-for-element';
import { renderGizmo } from './render-gizmo';
import type { GizmoParts, OverlayView, ScreenData } from './overlay.type';

const drawSelectedGizmo = (ctx: CanvasRenderingContext2D, view: OverlayView, screenData: ScreenData, parts: GizmoParts): void => {
  const store = useShadowEditorStore.getState();
  if (!(store.activeTool === 'select' && store.selectedElementId && store.selectedType === 'heightmap')) return;
  const el = screenData.heightmap.find((h) => h.id === store.selectedElementId);
  if (!el) return;
  const gizmoCtx = gizmoContextForElement(view, el);
  if (gizmoCtx) {
    ctx.globalAlpha = 1.0;
    renderGizmo(ctx, gizmoCtx, parts.hovered, parts.active);
  }
};

export { drawSelectedGizmo };
