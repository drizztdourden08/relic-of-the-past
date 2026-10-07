/* @layer renderer-components @kind component */
/** The table's options button, in the footer. Opens upwards and right-aligned, since the trigger sits in the bottom-right corner. */
import { Button } from '../../../primitives/Button';
import { DropdownMenu } from '../../DropdownMenu';
import { useMenuOpen } from '../../field-kits/behavior/use-menu-open';
import { buildTableMenuItems } from '../behavior/table-menu-items';
import type { PickerNode } from '../behavior/field-picker-nodes';
import type { TableActions } from '../DataTable.type';

interface TableOptionsMenuProps {
  /** Anything at all is sorted / grouped, which is what greys the clears out. */
  sortActive: boolean;
  groupActive: boolean;
  /** The addable field tree, offered here as an append-at-the-end submenu. */
  fieldNodes?: readonly PickerNode[];
  actions: TableActions;
}

const TableOptionsMenu = (props: TableOptionsMenuProps) => {
  const { sortActive, groupActive, fieldNodes, actions } = props;
  const menu = useMenuOpen<HTMLButtonElement>();

  const items = buildTableMenuItems({
    sortActive, groupActive, fieldNodes, actions, onClose: menu.close,
  });

  return (
    <>
      <Button
        ref={menu.anchorRef}
        variant="bare"
        size="sm"
        className="data-table__options"
        aria-label="Table options"
        aria-haspopup="menu"
        aria-expanded={menu.open}
        title="Table options"
        onClick={menu.toggle}
      >
        ⚙
      </Button>
      {menu.open && <DropdownMenu items={items} anchorRef={menu.anchorRef} side="above" align="end" />}
    </>
  );
};

export { TableOptionsMenu };
export type { TableOptionsMenuProps };
