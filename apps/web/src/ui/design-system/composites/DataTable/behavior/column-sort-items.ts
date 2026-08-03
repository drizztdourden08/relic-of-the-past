/* @layer renderer-components @kind logic */
/**
 * The sort block of a column's ⋯ menu — its own file because it is the one part
 * of that menu whose SHAPE changes with state rather than just its wording.
 *
 * A direction is a choice, not a toggle: offering "ascending" and "descending"
 * as two entries says what each one will do, where a single "sort by" entry
 * only says that something will happen. So an unsorted column offers both, and
 * a sorted one offers the direction it is NOT currently in — the option that is
 * already in effect would be a no-op with a tick beside it.
 *
 * Removing the sort is offered next to it, and only while there is one. The
 * footer's "Clear all sorting" drops every level at once, which is the wrong
 * tool for a column that joined a multi-column sort by mistake.
 */
import type { MenuEntry } from '../../DropdownMenu';
import type { SortEntry } from '../../../data/table/types';
import type { ColumnActions } from '../DataTable.type';

interface ColumnSortInput {
  path: string;
  /** This column's own current direction, when it's part of the active sort. */
  sortDir?: SortEntry['dir'];
  actions: ColumnActions;
  /** Wraps an action so the menu closes before its change lands. */
  act: (run: () => void) => () => void;
}

const SORT_DIR_LABEL = { asc: 'ascending', desc: 'descending' } as const;

/** Same glyphs the header's own caret uses, so the menu names what it shows. */
const SORT_DIR_ICON = { asc: '▴', desc: '▾' } as const;

const directionEntry = (input: ColumnSortInput, dir: SortEntry['dir']): MenuEntry => ({
  key: `sort-${dir}`,
  icon: SORT_DIR_ICON[dir],
  label: `Sort ${SORT_DIR_LABEL[dir]}`,
  onClick: input.act(() => input.actions.onSortDir(input.path, dir)),
});

const buildColumnSortItems = (input: ColumnSortInput): MenuEntry[] => {
  const { path, sortDir, actions, act } = input;

  if (!sortDir) return [directionEntry(input, 'asc'), directionEntry(input, 'desc')];

  return [
    directionEntry(input, sortDir === 'asc' ? 'desc' : 'asc'),
    {
      key: 'sort-remove',
      icon: '⌫',
      label: `Remove sort on this column (${SORT_DIR_LABEL[sortDir]})`,
      onClick: act(() => actions.onRemoveSort(path)),
    },
  ];
};

export { SORT_DIR_ICON, SORT_DIR_LABEL, buildColumnSortItems };
export type { ColumnSortInput };
