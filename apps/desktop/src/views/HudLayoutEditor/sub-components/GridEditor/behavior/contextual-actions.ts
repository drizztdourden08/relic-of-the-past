/* @layer renderer-components @kind logic */
import { cellActions } from './cell-actions';
import { trackActions } from './grid-track-actions';
import type { GridAction, GridActionContext } from '../GridEditor.type';

const contextualActions = (ctx: GridActionContext): GridAction[] => {
  switch (ctx.selection.kind) {
    case 'cells': return cellActions(ctx);
    case 'track': return trackActions(ctx);
    default: return [];
  }
};

export { contextualActions };
