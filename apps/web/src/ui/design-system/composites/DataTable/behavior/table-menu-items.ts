/* @layer renderer-components @kind logic */
/**
 * The footer menu as data — the same pure-builder shape as the column menu next
 * door, for the actions that are about the table rather than about a column.
 *
 * These three used to be repeated, identically, in every column's ⋯ menu, where
 * "Clear all sorting" read as if it belonged to whichever column you happened to
 * have opened. There is one table, so there is one place to say it.
 *
 * Adding a column belongs to a column — before this one, after this one — and
 * lives in the ⋯ menus for that reason. It is offered ONCE more here, appending
 * at the end, for the two cases a column's own menu cannot serve: not caring
 * where the column lands, and a table whose columns have all been removed,
 * where there is no ⋯ menu left to open.
 */
import { buildFieldMenuItems } from './field-menu-items';
import type { MenuEntry } from '../../DropdownMenu';
import type { PickerNode } from './field-picker-nodes';
import type { TableActions } from '../DataTable.type';

interface TableMenuInput {
  /** Anything at all is sorted / grouped — not necessarily any one column. */
  sortActive: boolean;
  groupActive: boolean;
  /** The addable field tree, already stripped of the columns on screen. */
  fieldNodes?: readonly PickerNode[];
  actions: TableActions;
  onClose: () => void;
}

const buildTableMenuItems = (input: TableMenuInput): MenuEntry[] => {
  const { sortActive, groupActive, fieldNodes = [], actions, onClose } = input;
  /** Every action closes the menu first — a menu that lingers over the change it made reads as broken. */
  const act = (run: () => void) => () => {
    onClose();
    run();
  };

  return [
    {
      key: 'add-column',
      icon: '＋',
      label: 'Add column',
      children: buildFieldMenuItems({
        nodes: fieldNodes,
        onPick: (field: string) => act(() => actions.onAddColumn(field))(),
      }),
    },
    'separator',
    {
      key: 'clear-sort',
      icon: '⌫',
      label: 'Clear all sorting',
      disabled: !sortActive,
      onClick: act(actions.onClearSort),
    },
    {
      key: 'clear-group',
      icon: '⌫',
      label: 'Clear all grouping',
      disabled: !groupActive,
      onClick: act(actions.onClearGroupBy),
    },
    'separator',
    /*
     * Sizing every column one ⋯ menu at a time is the same click over and over,
     * and it is the whole table's layout that is being tidied — so it belongs
     * beside the reset rather than repeated in each column.
     */
    {
      key: 'fit-all',
      icon: '↔',
      label: 'Fit all to content',
      onClick: act(actions.onFitAllToContent),
    },
    { key: 'reset', icon: '↺', label: 'Reset columns to defaults', onClick: act(actions.onResetColumns) },
  ];
};

export { buildTableMenuItems };
export type { TableMenuInput };
