/* @layer renderer-components @kind logic */
/**
 * The footer menu as data, for table-wide actions. Adding a column is offered
 * here once more (appending) for a table whose columns have all been removed.
 */
import { buildFieldMenuItems } from './field-menu-items';
import type { MenuEntry } from '../../DropdownMenu';
import type { PickerNode } from './field-picker-nodes';
import type { TableActions } from '../DataTable.type';

interface TableMenuInput {
  /** True when anything is sorted or grouped, not necessarily any one column. */
  sortActive: boolean;
  groupActive: boolean;
  /** The addable field tree, already stripped of the columns on screen. */
  fieldNodes?: readonly PickerNode[];
  actions: TableActions;
  onClose: () => void;
}

const buildTableMenuItems = (input: TableMenuInput): MenuEntry[] => {
  const { sortActive, groupActive, fieldNodes = [], actions, onClose } = input;
  /** Every action closes the menu first. */
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
