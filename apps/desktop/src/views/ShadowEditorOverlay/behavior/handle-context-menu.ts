/* @layer renderer-components @kind logic */
import type { MouseEvent } from 'react';
import { useShadowEditorStore } from '@app/stores/shadow-editor-store';
import { resetDrag } from './reset-drag';
import { revertDrag } from './revert-drag';
import type { HandlerDeps } from './overlay.type';

const createContextMenu = (d: HandlerDeps) => (e: MouseEvent): void => {
  e.preventDefault();
  if (d.isDragging || d.activeGizmoRef.current) {
    revertDrag(d, useShadowEditorStore.getState(), d.vpRef.current);
    resetDrag(d);
    return;
  }
  if (d.isDrawingFreehand) {
    d.clearFreehandPoints();
    d.setIsDrawingFreehand(false);
  }
};

export { createContextMenu };
