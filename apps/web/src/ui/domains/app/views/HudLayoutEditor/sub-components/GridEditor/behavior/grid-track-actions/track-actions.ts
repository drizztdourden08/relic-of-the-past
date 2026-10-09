/* @layer renderer-components @kind logic */
import { EARLIER_ICON, EARLIER_KEY, GRID_ICONS, LATER_ICON, LATER_KEY } from '../grid-icons';
import { ONE } from './grid-track-actions.constants';
import { insertRun } from './insert-run';
import { rangeLabel } from './range-label';
import { removeRun } from './remove-run';
import { shiftRun } from './shift-run';
import { tracksOf } from './tracks-of';
import type { GridAction, GridActionContext } from '../../GridEditor.type';

const trackActions = (ctx: GridActionContext): GridAction[] => {
  if (ctx.selection.kind !== 'track') return [];
  const { axis, indices } = ctx.selection;
  const count = Math.max(tracksOf(ctx.container, axis).length, axis === 'rows' ? ctx.rows : 0);
  const name = rangeLabel(axis, indices);
  const first = Math.min(...indices);
  const last = Math.max(...indices);
  const single = indices.length === 1;
  const canEarlier = single && first > 0;
  const canLater = single && last < count - 1;

  return [
    {
      key: 'move-earlier', kind: 'button', icon: EARLIER_ICON[axis], group: 'order',
      label: `Move ${name} earlier`, disabled: !canEarlier,
      ...(canEarlier ? { shortcut: { keys: [EARLIER_KEY[axis]] }, run: shiftRun(ctx, axis, first, -1) } : {}),
    },
    {
      key: 'move-later', kind: 'button', icon: LATER_ICON[axis], group: 'order',
      label: `Move ${name} later`, disabled: !canLater,
      ...(canLater ? { shortcut: { keys: [LATER_KEY[axis]] }, run: shiftRun(ctx, axis, last, 1) } : {}),
    },
    {
      key: 'insert-before', kind: 'button', group: 'insert',
      icon: axis === 'columns' ? GRID_ICONS.insertColumnBefore : GRID_ICONS.insertRowBefore,
      label: `Insert a ${ONE[axis]} before ${first + 1}`, run: insertRun(ctx, axis, first),
    },
    {
      key: 'insert-after', kind: 'button', group: 'insert',
      icon: axis === 'columns' ? GRID_ICONS.insertColumnAfter : GRID_ICONS.insertRowAfter,
      label: `Insert a ${ONE[axis]} after ${last + 1}`, run: insertRun(ctx, axis, last + 1),
    },
    {
      key: 'remove', kind: 'button', icon: GRID_ICONS.remove, group: 'remove',
      label: `Remove ${name}. Its children move to the nearest track`,
      shortcut: { keys: ['Del'] }, run: removeRun(ctx, axis, indices),
    },
  ];
};

export { trackActions };
