/* @layer renderer-components @kind component */
/** The ⋯ menu: the shared dropdown, fed by a pure entry builder. */
import { DropdownMenu } from '../../DropdownMenu';
import { buildColumnMenuItems } from '../behavior/column-menu-items';
import type { RefObject } from 'react';
import type { FieldDescriptor } from '../../../data/schema/field-descriptor';
import type { SortEntry } from '../../../data/table/types';
import type { IdRefTargetFieldResolver } from '../behavior/display-substitution';
import type { PickerNode } from '../behavior/field-picker-nodes';
import type { ColumnActions } from '../DataTable.type';

interface ColumnMenuProps {
  path: string;
  index: number;
  columnCount: number;
  grouped: boolean;
  sortDir?: SortEntry['dir'];
  grow?: boolean;
  /** This column is already in the persistent fit-to-content mode. */
  fit?: boolean;
  /** This column's field, and its reference-display state (the "Display as" submenu). */
  field?: FieldDescriptor;
  displayField?: string;
  resolveTargetFields?: IdRefTargetFieldResolver;
  /** The addable field tree, offered as the two add-column submenus. */
  fieldNodes?: readonly PickerNode[];
  actions: ColumnActions;
  anchorRef: RefObject<HTMLElement | null>;
  onStartRename: () => void;
  onClose: () => void;
}

const ColumnMenu = (props: ColumnMenuProps) => {
  const {
    path, index, columnCount, grouped, sortDir, grow, fit, fieldNodes,
    field, displayField, resolveTargetFields, actions, anchorRef, onStartRename, onClose,
  } = props;

  const items = buildColumnMenuItems({
    path, index, columnCount, grouped, sortDir, grow, fit, fieldNodes,
    field, displayField, resolveTargetFields, actions, onStartRename, onClose,
  });

  return <DropdownMenu items={items} anchorRef={anchorRef} />;
};

export { ColumnMenu };
export type { ColumnMenuProps };
