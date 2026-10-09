/* @layer tests @kind test */
import { describe, it, expect, vi } from 'vitest';
import {
  buildPickerNodes,
} from '../../../apps/web/src/ui/design-system/composites/DataTable/behavior/field-picker-nodes';
import {
  buildTableMenuItems,
} from '../../../apps/web/src/ui/design-system/composites/DataTable/behavior/table-menu-items';
import {
  collectGroupUids, groupUid,
} from '../../../apps/web/src/ui/design-system/composites/DataTable/behavior/group-uid';
import type { MenuItem } from '../../../apps/web/src/ui/design-system/composites/DropdownMenu';
import type { GroupedRow } from '../../../apps/web/src/ui/design-system/data/table/types';
import type {
  TableActions,
} from '../../../apps/web/src/ui/design-system/composites/DataTable/DataTable.type';
import { NESTED } from './data-table-menus.constants';
import { entryLookup } from './entry-lookup';

const stubTableActions = (): TableActions => ({
  onAddColumn: vi.fn(), onClearSort: vi.fn(), onClearGroupBy: vi.fn(),
  onFitAllToContent: vi.fn(), onResetColumns: vi.fn(),
});

const tableMenu = (overrides: Partial<Parameters<typeof buildTableMenuItems>[0]> = {}) => {
  const actions = stubTableActions();
  const onClose = vi.fn();
  const items = buildTableMenuItems({
    sortActive: false, groupActive: false, actions, onClose, ...overrides,
  });
  const entries = items.filter((entry): entry is MenuItem => entry !== 'separator');
  return { actions, entries, byKey: entryLookup(entries), onClose };
};

describe('the footer menu: what belongs to the table instead of a column', () => {
  it('holds the three that used to be repeated in every column, the fit-all and one add', () => {
    expect(tableMenu().entries.map((entry) => entry.key))
      .toEqual(['add-column', 'clear-sort', 'clear-group', 'fit-all', 'reset']);
  });

  it('appends the field it is given, since it has no column to place it against', () => {
    const { actions, entries } = tableMenu({ fieldNodes: buildPickerNodes(NESTED, ['id']) });
    const add = entries.find((entry) => entry.key === 'add-column');
    add?.children?.find((child) => child.key === 'tags')?.onClick?.();
    expect(actions.onAddColumn).toHaveBeenCalledWith('tags');
  });

  it('is still reachable with no columns at all, which is when it matters most', () => {
    const { entries } = tableMenu({ fieldNodes: buildPickerNodes(NESTED) });
    const add = entries.find((entry) => entry.key === 'add-column');
    expect(add?.children?.map((child) => child.key)).toEqual(['id', 'outer', 'tags']);
  });

  it('sits the fit-all with the reset, both being about the layout as a whole', () => {
    const keys = tableMenu().entries.map((entry) => entry.key);
    expect(keys.indexOf('fit-all')).toBe(keys.indexOf('reset') - 1);
  });

  it('fits every column at once, which is the point of it being here', () => {
    const { actions, byKey } = tableMenu();
    byKey('fit-all').onClick?.();
    expect(actions.onFitAllToContent).toHaveBeenCalledTimes(1);
  });

  it('never greys the fit-all out, because there is always something to fit', () => {
    expect(tableMenu().byKey('fit-all').disabled).toBeUndefined();
  });

  it('greys out clearing what is not set', () => {
    expect(tableMenu().byKey('clear-sort').disabled).toBe(true);
    expect(tableMenu().byKey('clear-group').disabled).toBe(true);
    expect(tableMenu({ sortActive: true }).byKey('clear-sort').disabled).toBe(false);
    expect(tableMenu({ groupActive: true }).byKey('clear-group').disabled).toBe(false);
  });

  it('never greys out the reset, because a layout can always go back to its default', () => {
    expect(tableMenu().byKey('reset').disabled).toBeUndefined();
  });

  it('closes before it acts, the same as the column menu does', () => {
    const { actions, byKey, onClose } = tableMenu({ sortActive: true });
    byKey('clear-sort').onClick?.();
    expect(onClose).toHaveBeenCalled();
    expect(actions.onClearSort).toHaveBeenCalled();
  });
});

describe('group identity', () => {
  const tree: readonly GroupedRow<unknown>[] = [
    {
      kind: 'group', level: 0, key: 'a', path: 'world', count: 2,
      children: [
        { kind: 'group', level: 1, key: 'a', path: 'kind', count: 1, children: [{ kind: 'row', row: 1 }] },
        { kind: 'group', level: 1, key: 'b', path: 'kind', count: 1, children: [{ kind: 'row', row: 2 }] },
      ],
    },
  ];

  it('keeps two levels sharing a key value apart', () => {
    const uids = collectGroupUids(tree);
    expect(new Set(uids).size).toBe(uids.length);
    expect(uids[1]).toBe(groupUid(uids[0], 'kind', 'a'));
  });

  it('yields nothing for an ungrouped tree, so nothing is seeded as expanded', () => {
    expect(collectGroupUids([{ kind: 'row', row: 1 }, { kind: 'row', row: 2 }])).toEqual([]);
  });
});
