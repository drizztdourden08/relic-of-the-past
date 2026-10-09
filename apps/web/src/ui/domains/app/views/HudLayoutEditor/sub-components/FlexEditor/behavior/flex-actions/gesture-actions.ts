/* @layer renderer-components @kind logic */
import { GESTURES } from './flex-actions.constants';
import type { EditorAction, FlexActionContext } from '../../FlexEditor.type';

const gestureActions = (ctx: FlexActionContext): EditorAction[] => {
  if (ctx.selection.kind !== 'items') return GESTURES;
  return [
    { key: 'move-cursor', kind: 'gesture', label: 'move', shortcut: { keys: ['←', '→'] } },
    { key: 'clear', kind: 'gesture', label: 'clear', shortcut: { keys: ['Esc'] } },
  ];
};

export { gestureActions };
