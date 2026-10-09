/* @layer renderer-components @kind logic */
import { contextualActions } from './contextual-actions';
import { gestureActions } from './gesture-actions';
import type { GridAction, GridActionContext } from '../GridEditor.type';

const gridActions = (ctx: GridActionContext): GridAction[] =>
  [...contextualActions(ctx), ...gestureActions(ctx)];

export { gridActions };
export { contextualActions } from './contextual-actions';
export { gestureActions } from './gesture-actions';
