/* @layer renderer-components @kind logic */
import { gesturesOf } from './grid-actions.constants';
import type { GridAction, GridActionContext } from '../GridEditor.type';

const gestureActions = (ctx: GridActionContext): GridAction[] => {
  switch (ctx.selection.kind) {
    case 'cells': return [
      { key: 'move-cursor', kind: 'gesture', label: ctx.t('hud-editor:grid.gesture.move'), shortcut: { keys: ['left', 'right', 'up', 'down'] } },
      { key: 'extend', kind: 'gesture', label: ctx.t('hud-editor:grid.gesture.extend'), shortcut: { keys: ['shift', 'left', 'right', 'up', 'down'] } },
      { key: 'clear', kind: 'gesture', label: ctx.t('hud-editor:grid.gesture.clear'), shortcut: { keys: ['esc'] } },
    ];
    case 'track': return [{ key: 'clear', kind: 'gesture', label: ctx.t('hud-editor:grid.gesture.clear'), shortcut: { keys: ['esc'] } }];
    case 'none': return gesturesOf(ctx.t);
  }
};

export { gestureActions };
