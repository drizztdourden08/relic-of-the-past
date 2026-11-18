/* @layer renderer-components @kind logic */
import { EARLIER_ICON, EARLIER_KEY, GRID_ICONS, LATER_ICON, LATER_KEY } from './grid-icons.constants';
import { insertRun } from './insert-run';
import { rangeLabel } from './range-label';
import { removeRun } from './remove-run';
import { shiftRun } from './shift-run';
import { tracksOf } from './tracks-of';
import type { GridAction, GridActionContext } from '../GridEditor.type';

const trackActions = (ctx: GridActionContext): GridAction[] => {
  if (ctx.selection.kind !== 'track') return [];
  const { axis, indices } = ctx.selection;
  const count = Math.max(tracksOf(ctx.container, axis).length, axis === 'rows' ? ctx.rows : 0);
  const { t } = ctx;
  const name = rangeLabel(axis, indices, t);
  const isColumns = axis === 'columns';
  const first = Math.min(...indices);
  const last = Math.max(...indices);
  const single = indices.length === 1;
  const canEarlier = single && first > 0;
  const canLater = single && last < count - 1;

  return [
    {
      key: 'move-earlier', kind: 'button', icon: EARLIER_ICON[axis], group: 'order',
      label: t('hud-editor:grid.move.earlier', { name }), disabled: !canEarlier,
      ...(canEarlier ? { shortcut: { keys: [EARLIER_KEY[axis]] }, run: shiftRun(ctx, axis, first, -1) } : {}),
    },
    {
      key: 'move-later', kind: 'button', icon: LATER_ICON[axis], group: 'order',
      label: t('hud-editor:grid.move.later', { name }), disabled: !canLater,
      ...(canLater ? { shortcut: { keys: [LATER_KEY[axis]] }, run: shiftRun(ctx, axis, last, 1) } : {}),
    },
    {
      key: 'insert-before', kind: 'button', group: 'insert',
      icon: axis === 'columns' ? GRID_ICONS.insertColumnBefore : GRID_ICONS.insertRowBefore,
      label: isColumns
        ? t('hud-editor:grid.insert.column.before', { n: first + 1 })
        : t('hud-editor:grid.insert.row.before', { n: first + 1 }), run: insertRun(ctx, axis, first),
    },
    {
      key: 'insert-after', kind: 'button', group: 'insert',
      icon: axis === 'columns' ? GRID_ICONS.insertColumnAfter : GRID_ICONS.insertRowAfter,
      label: isColumns
        ? t('hud-editor:grid.insert.column.after', { n: last + 1 })
        : t('hud-editor:grid.insert.row.after', { n: last + 1 }), run: insertRun(ctx, axis, last + 1),
    },
    {
      key: 'remove', kind: 'button', icon: GRID_ICONS.remove, group: 'remove',
      label: t('hud-editor:grid.remove.track', { name }),
      shortcut: { keys: ['delete'] }, run: removeRun(ctx, axis, indices),
    },
  ];
};

export { trackActions };
