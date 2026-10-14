/* @layer renderer-components @kind logic */
import { EARLIER_ICON, EARLIER_KEY, END_ICON, LATER_ICON, LATER_KEY, START_ICON } from '../../GridEditor/behavior/grid-icons.constants';
import { axisOf } from './axis-of';
import { moveRun } from './move-run';
import { nameOf } from './name-of';
import type { EditorAction, FlexActionContext, MoveSpec } from '../FlexEditor.type';

const contextualActions = (ctx: FlexActionContext): EditorAction[] => {
  if (ctx.selection.kind !== 'items') return [];
  const { indices } = ctx.selection;
  const axis = axisOf(ctx.container.direction);
  const last = ctx.container.children.length - 1;
  const first = Math.min(...indices);
  const end = Math.max(...indices);
  const name = indices.length === 1 ? nameOf(ctx, first) : `${indices.length} children`;

  const move = (spec: MoveSpec): EditorAction => {
    const { key, icon, label, can, from, to, cap } = spec;
    return {
      key, kind: 'button', icon, group: 'order', label: `Move ${name} ${label}`, disabled: !can,
      ...(cap === undefined ? {} : { shortcut: { keys: [cap] } }),
      ...(can ? { run: moveRun(ctx, from, to) } : {}),
    };
  };

  return [
    move({ key: 'move-start', icon: START_ICON[axis], label: 'to the start', can: first > 0, from: first, to: 0 }),
    move({
      key: 'move-earlier', icon: EARLIER_ICON[axis], label: 'earlier', can: first > 0,
      from: first, to: first - 1, cap: EARLIER_KEY[axis],
    }),
    move({
      key: 'move-later', icon: LATER_ICON[axis], label: 'later', can: end < last,
      from: end, to: end + 1, cap: LATER_KEY[axis],
    }),
    move({ key: 'move-end', icon: END_ICON[axis], label: 'to the end', can: end < last, from: end, to: last }),
  ];
};

export { contextualActions };
