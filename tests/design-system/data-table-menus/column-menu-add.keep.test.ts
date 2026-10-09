/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import {
  buildPickerNodes,
} from '../../../apps/web/src/ui/design-system/composites/DataTable/behavior/field-picker-nodes';
import type {
  buildColumnMenuItems,
} from '../../../apps/web/src/ui/design-system/composites/DataTable/behavior/column-menu-items';
import type { MenuItem } from '../../../apps/web/src/ui/design-system/composites/DropdownMenu';
import { NESTED } from './data-table-menus.constants';
import { columnMenu as menu } from './column-menu';

const flattenLeaves = (items: readonly MenuItem[]): MenuItem[] =>
  items.flatMap((item) => (item.children ? flattenLeaves(item.children) : [item]));

const leafAt = (items: readonly MenuItem[], key: string): MenuItem => {
  const found = flattenLeaves(items).find((item) => item.key === key);
  if (!found) throw new Error(`no entry ${key}`);
  return found;
};

describe('ColumnMenu adding a column before or after this one', () => {
  const nodes = buildPickerNodes(NESTED, ['id']);
  const addMenu = (overrides: Partial<Parameters<typeof buildColumnMenuItems>[0]> = {}) =>
    menu({ fieldNodes: nodes, ...overrides });

  it('offers both, each opening the field tree as a submenu instead of a panel', () => {
    const { byKey } = addMenu();
    expect(byKey('add-before').children?.map((child) => child.key)).toEqual(['outer', 'tags']);
    expect(byKey('add-after').children?.map((child) => child.key)).toEqual(['outer', 'tags']);
    expect(byKey('add-before').onClick).toBeUndefined();
  });

  it('nests as deep as the schema does, so a grandchild is still reachable', () => {
    const before = addMenu().byKey('add-before').children ?? [];
    expect(leafAt(before, 'outer.mid.deep.c').label).toBe('outer.mid.deep.c');
  });

  it('lands "before" at this column\'s own index', () => {
    const { actions, byKey } = addMenu({ index: 1 });
    leafAt(byKey('add-before').children ?? [], 'tags').onClick?.();
    expect(actions.onAddColumnAt).toHaveBeenCalledWith('tags', 1);
  });

  it('lands "after" one past it', () => {
    const { actions, byKey } = addMenu({ index: 1 });
    leafAt(byKey('add-after').children ?? [], 'tags').onClick?.();
    expect(actions.onAddColumnAt).toHaveBeenCalledWith('tags', 2);
  });

  it('reads the index off the column, so the last column appends', () => {
    const { actions, byKey } = addMenu({ index: 2, columnCount: 3 });
    leafAt(byKey('add-after').children ?? [], 'tags').onClick?.();
    expect(actions.onAddColumnAt).toHaveBeenCalledWith('tags', 3);
  });

  it('closes the menu before the column arrives, like every other action', () => {
    const { byKey, onClose } = addMenu();
    leafAt(byKey('add-before').children ?? [], 'tags').onClick?.();
    expect(onClose).toHaveBeenCalled();
  });

  it('says so, greyed, instead of opening onto nothing when every field is shown', () => {
    const [empty] = menu({ fieldNodes: [] }).byKey('add-before').children ?? [];
    expect(empty.disabled).toBe(true);
    expect(empty.onClick).toBeUndefined();
  });
});
