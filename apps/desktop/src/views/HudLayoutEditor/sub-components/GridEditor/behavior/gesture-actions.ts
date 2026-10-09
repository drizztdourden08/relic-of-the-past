/* @layer renderer-components @kind logic */
import { GESTURES } from './grid-actions.constants';
import type { GridAction, GridActionContext } from '../GridEditor.type';

const gestureActions = (ctx: GridActionContext): GridAction[] => {
  switch (ctx.selection.kind) {
    case 'cells': return [
      { key: 'move-cursor', kind: 'gesture', label: 'move', shortcut: { keys: ['left', 'right', 'up', 'down'] } },
      { key: 'extend', kind: 'gesture', label: 'extend', shortcut: { keys: ['shift', 'left', 'right', 'up', 'down'] } },
      { key: 'clear', kind: 'gesture', label: 'clear', shortcut: { keys: ['esc'] } },
    ];
    case 'track': return [{ key: 'clear', kind: 'gesture', label: 'clear', shortcut: { keys: ['esc'] } }];
    default: return GESTURES;
  }
};

export { gestureActions };
