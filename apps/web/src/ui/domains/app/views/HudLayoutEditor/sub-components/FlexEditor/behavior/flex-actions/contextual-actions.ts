/* @layer renderer-components @kind logic */
import {
  EARLIER_ICON, EARLIER_KEY, END_ICON, LATER_ICON, LATER_KEY, START_ICON,
} from '../../../GridEditor/behavior/grid-icons';
import { axisOf } from './axis-of';
import { moveRun } from './move-run';
import { nameOf } from './name-of';
import type { EditorAction, FlexActionContext } from '../../FlexEditor.type';

const contextualActions = (ctx: FlexActionContext): EditorAction[] => {
  if (ctx.selection.kind !== 'items') return [];
  const { indices } = ctx.selection;
  const axis = axisOf(ctx.container.direction);
  const last = ctx.container.children.length - 1;
  const first = Math.min(...indices);
  const end = Math.max(...indices);
  const name = indices.length === 1 ? nameOf(ctx, first) : `${indices.length} children`;

  const move = (
    key: string, group: string, icon: EditorAction['icon'], label: string,
    can: boolean, from: number, to: number, cap?: string,
  ): EditorAction => ({
    key, kind: 'button', icon, group, label: `Move ${name} ${label}`, disabled: !can,
    ...(cap === undefined ? {} : { shortcut: { keys: [cap] } }),
    ...(can ? { run: moveRun(ctx, from, to) } : {}),
  });

  return [
    move('move-start', 'order', START_ICON[axis], 'to the start', first > 0, first, 0),
    move('move-earlier', 'order', EARLIER_ICON[axis], 'earlier', first > 0, first, first - 1, EARLIER_KEY[axis]),
    move('move-later', 'order', LATER_ICON[axis], 'later', end < last, end, end + 1, LATER_KEY[axis]),
    move('move-end', 'order', END_ICON[axis], 'to the end', end < last, end, last),
  ];
};

export { contextualActions };
