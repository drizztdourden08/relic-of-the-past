/* @layer renderer-components @kind logic */
/**
 * The sort block of a column's ⋯ menu; its shape changes with state. An
 * unsorted column offers both directions, a sorted one offers the other
 * direction plus "remove sort on this column".
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
