/* @layer renderer-components @kind logic */
import { gesturesOf } from './flex-actions.constants';
import type { EditorAction, FlexActionContext } from '../FlexEditor.type';

const gestureActions = (ctx: FlexActionContext): EditorAction[] => {
  if (ctx.selection.kind !== 'items') return gesturesOf(ctx.t);
  return [
    { key: 'move-cursor', kind: 'gesture', label: ctx.t('hud-editor:grid.gesture.move'), shortcut: { keys: ['left', 'right'] } },
    { key: 'clear', kind: 'gesture', label: ctx.t('hud-editor:grid.gesture.clear'), shortcut: { keys: ['esc'] } },
  ];
};

export { gestureActions };
