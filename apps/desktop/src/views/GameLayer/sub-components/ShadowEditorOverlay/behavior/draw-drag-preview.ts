/* @layer renderer-components @kind logic */
import { useShadowEditorStore } from '@app/stores/shadow-editor-store';
import { dragPreviewBox } from './drag-preview-box';
import type { OverlayView, Point } from './overlay.type';
import { paintDragPreview } from './paint-drag-preview';

const drawDragPreview = (ctx: CanvasRenderingContext2D, view: OverlayView, mouseDisplay: Point | null): void => {
  const store = useShadowEditorStore.getState();
  const { dragStartWorld } = store;
  const shapeTool = store.activeTool === 'polygon' || store.activeTool === 'shape-light';
  if (!shapeTool || !store.isDragging || !dragStartWorld || !mouseDisplay) return;
  const box = dragPreviewBox(view, dragStartWorld, mouseDisplay);
  if (box) paintDragPreview(ctx, box, store.polygonSides, store.activeTool === 'shape-light');
};

export { drawDragPreview };
