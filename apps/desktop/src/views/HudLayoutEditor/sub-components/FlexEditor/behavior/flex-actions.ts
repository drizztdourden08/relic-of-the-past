/* @layer renderer-components @kind logic */
import { contextualActions } from './contextual-actions';
import { gestureActions } from './gesture-actions';
import type { EditorAction, FlexActionContext } from '../FlexEditor.type';

const flexActions = (ctx: FlexActionContext): EditorAction[] =>
  [...contextualActions(ctx), ...gestureActions(ctx)];

export { flexActions };
