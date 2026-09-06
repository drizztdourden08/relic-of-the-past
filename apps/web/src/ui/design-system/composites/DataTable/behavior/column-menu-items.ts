/* @layer renderer-components @kind logic */
/**
 * The ⋯ menu as data: a pure function of the column's position and state, so
 * wording, order and disabled rules are testable. Every action here is about
 * this column; table-wide ones live in the footer menu. A header click replaces
 * the whole sort; this menu adds a level, the only route to multi-column sort.
 */
import { buildColumnDisplayItems } from './column-display-items';
import { buildColumnSortItems } from './column-sort-items';
import { buildFieldMenuItems } from './field-menu-items';
import type { MenuEntry } from '../../DropdownMenu';
import type { FieldDescriptor } from '../../../data/schema/field-descriptor';
import type { SortEntry } from '../../../data/table/types';
import type { IdRefTargetFieldResolver } from './display-substitution';
import type { PickerNode } from './field-picker-nodes';
import type { ColumnActions } from '../DataTable.type';

interface ColumnMenuInput {
  path: string;
  index: number;
  columnCount: number;
  /** This column is one of the groupBy levels. */
  grouped: boolean;
  /** This column's own current direction, when it's part of the active sort. */
  sortDir?: SortEntry['dir'];
  /** This column is already taking the row's leftover width. */
  grow?: boolean;
  /** This column is already in the persistent fit-to-content mode. */
  fit?: boolean;
  /** This column's field, which says whether it references another collection. */
  field?: FieldDescriptor;
  /** The target-record field this column shows in place of the id, if any. */
  displayField?: string;
  /** Injected: which fields the referenced collection offers to display. */
  resolveTargetFields?: IdRefTargetFieldResolver;
  /** The addable field tree, already stripped of the columns on screen. */
  fieldNodes?: readonly PickerNode[];
  actions: ColumnActions;
  onStartRename: () => void;
  onClose: () => void;
}

const buildColumnMenuItems = (input: ColumnMenuInput): MenuEntry[] => {
  const {
    path, index, columnCount, grouped, sortDir, grow, fit, fieldNodes = [],
    displayField, resolveTargetFields, actions, onStartRename, onClose,
  } = input;
  /* Renamed on the way in: `addAt` below already calls its picked path `field`. */
  const columnField = input.field;
  const isFirst = index <= 0;
  const isLast = index >= columnCount - 1;
  /** Every action closes the menu first. */
  const act = (run: () => void) => () => {
    onClose();
    run();
  };

  /* `at` is the slot the new column ends up in, so "after" is one past this one. */
  const addAt = (at: number) => buildFieldMenuItems({
    nodes: fieldNodes,
    onPick: (field: string) => act(() => actions.onAddColumnAt(field, at))(),
  });

  return [
    { key: 'add-before', icon: '＋', label: 'Add column before', children: addAt(index) },
    { key: 'add-after', icon: '＋', label: 'Add column after', children: addAt(index + 1) },
    'separator',
    { key: 'remove', icon: '✕', label: 'Remove column', onClick: act(() => actions.onRemove(path)) },
    { key: 'rename', icon: '✎', label: 'Rename...', onClick: act(onStartRename) },
    /* Beside the rename: both change how the column reads, neither its data. */
    ...buildColumnDisplayItems({
      path, field: columnField, displayField, resolveTargetFields, actions, act,
    }),
    'separator',
    { key: 'move-left', icon: '‹', label: 'Move left', disabled: isFirst, onClick: act(() => actions.onMove(path, 'left')) },
    { key: 'move-right', icon: '›', label: 'Move right', disabled: isLast, onClick: act(() => actions.onMove(path, 'right')) },
    { key: 'move-first', icon: '⇤', label: 'Move to first', disabled: isFirst, onClick: act(() => actions.onMove(path, 'first')) },
    { key: 'move-last', icon: '⇥', label: 'Move to last', disabled: isLast, onClick: act(() => actions.onMove(path, 'last')) },
    'separator',
    grouped
      ? { key: 'ungroup', icon: '▤', label: 'Ungroup this column', onClick: act(() => actions.onUngroup(path)) }
      : { key: 'group', icon: '▦', label: 'Group by this column', onClick: act(() => actions.onGroupBy(path)) },
    ...buildColumnSortItems({ path, sortDir, actions, act }),
    'separator',
    {
      key: 'fit',
      icon: '↔',
      label: 'Fit to content',
      disabled: fit === true,
      onClick: act(() => actions.onFitToContent(path)),
    },
    {
      key: 'expand',
      icon: '⤢',
      label: 'Expand to available space',
      disabled: grow === true,
      onClick: act(() => actions.onExpandToFill(path)),
    },
  ];
};

export { buildColumnMenuItems };
export type { ColumnMenuInput };
