/* @layer tests @kind test */
import { describe, it, expect, vi } from 'vitest';
import {
  buildPickerNodes,
} from '../../apps/web/src/ui/design-system/composites/DataTable/behavior/field-picker-nodes';
import {
  buildColumnMenuItems,
} from '../../apps/web/src/ui/design-system/composites/DataTable/behavior/column-menu-items';
import {
  buildTableMenuItems,
} from '../../apps/web/src/ui/design-system/composites/DataTable/behavior/table-menu-items';
import {
  collectGroupUids, groupUid,
} from '../../apps/web/src/ui/design-system/composites/DataTable/behavior/group-uid';
import type { MenuItem } from '../../apps/web/src/ui/design-system/composites/DropdownMenu';
import type { FieldDescriptor } from '../../apps/web/src/ui/design-system/data/schema/field-descriptor';
import type { GroupedRow } from '../../apps/web/src/ui/design-system/data/table/types';
import type {
  ColumnActions, TableActions,
} from '../../apps/web/src/ui/design-system/composites/DataTable/DataTable.type';

// The parts of the table's chrome that are pure functions: what a column's ⋯
// menu offers, what the footer's does, and how a nested group row is
// identified. The field tree those menus open is asserted next door, in
// data-table-field-tree.test.ts; rendering and interaction are covered (as far
// as they can be without a browser) in data-table-render.test.ts.

const field = (path: string, kind: FieldDescriptor['kind'], children?: FieldDescriptor[]): FieldDescriptor => {
  const descriptor: FieldDescriptor = { path, label: path, kind, optional: false };
  if (children) descriptor.children = children;
  return descriptor;
};

const NESTED: readonly FieldDescriptor[] = [
  field('id', 'idRef'),
  field('outer', 'object', [
    field('outer.a', 'string'),
    field('outer.mid', 'object', [
      field('outer.mid.b', 'number'),
      field('outer.mid.deep', 'union', [field('outer.mid.deep.c', 'boolean')]),
    ]),
  ]),
  field('tags', 'array'),
];

const stubActions = (): ColumnActions => ({
  onToggleSort: vi.fn(), onSortDir: vi.fn(), onRemoveSort: vi.fn(), onAddColumnAt: vi.fn(),
  onRemove: vi.fn(), onMove: vi.fn(), onRename: vi.fn(),
  onGroupBy: vi.fn(), onUngroup: vi.fn(), onResize: vi.fn(), onPreviewResize: vi.fn(),
  onFitToContent: vi.fn(), onExpandToFill: vi.fn(), onSetDisplayField: vi.fn(),
});

const entryLookup = (entries: MenuItem[]) => (key: string): MenuItem => {
  const found = entries.find((entry) => entry.key === key);
  if (!found) throw new Error(`no menu entry ${key}`);
  return found;
};

const menu = (overrides: Partial<Parameters<typeof buildColumnMenuItems>[0]> = {}) => {
  const actions = stubActions();
  const onClose = vi.fn();
  const onStartRename = vi.fn();
  const items = buildColumnMenuItems({
    path: 'kind', index: 1, columnCount: 3, grouped: false,
    actions, onStartRename, onClose, ...overrides,
  });
  const entries = items.filter((entry): entry is MenuItem => entry !== 'separator');
  return { actions, entries, byKey: entryLookup(entries), onClose, onStartRename };
};

describe('ColumnMenu — the entry list', () => {
  it('offers the two adds, remove, rename, the four moves, group, sort and the two sizings', () => {
    expect(menu().entries.map((entry) => entry.key)).toEqual([
      'add-before', 'add-after', 'remove', 'rename',
      'move-left', 'move-right', 'move-first', 'move-last',
      'group', 'sort-asc', 'sort-desc', 'fit', 'expand',
    ]);
  });

  it('carries nothing table-wide — those live once, in the footer menu', () => {
    const keys = menu().entries.map((entry) => entry.key);
    expect(keys).not.toContain('clear-sort');
    expect(keys).not.toContain('clear-group');
    expect(keys).not.toContain('reset');
  });

  it('sizes this column to what it is showing, or to whatever is left over', () => {
    const { actions, byKey } = menu();
    byKey('fit').onClick?.();
    expect(actions.onFitToContent).toHaveBeenCalledWith('kind');
    byKey('expand').onClick?.();
    expect(actions.onExpandToFill).toHaveBeenCalledWith('kind');
  });

  it('greys out expanding a column that already takes the leftover width', () => {
    expect(menu().byKey('expand').disabled).toBe(false);
    expect(menu({ grow: true }).byKey('expand').disabled).toBe(true);
    expect(menu({ grow: true }).byKey('fit').disabled).toBe(false);
  });

  it('greys out fitting a column already in the persistent fit-to-content mode', () => {
    expect(menu().byKey('fit').disabled).toBe(false);
    expect(menu({ fit: true }).byKey('fit').disabled).toBe(true);
    expect(menu({ fit: true }).byKey('expand').disabled).toBe(false);
  });

  it('disables the moves the column cannot make', () => {
    const first = menu({ index: 0 });
    expect(first.byKey('move-left').disabled).toBe(true);
    expect(first.byKey('move-first').disabled).toBe(true);
    expect(first.byKey('move-right').disabled).toBe(false);
    const last = menu({ index: 2 });
    expect(last.byKey('move-last').disabled).toBe(true);
    expect(last.byKey('move-right').disabled).toBe(true);
  });

  it('swaps group for ungroup once the column is a grouping level', () => {
    expect(menu({ grouped: true }).entries.map((entry) => entry.key)).toContain('ungroup');
    expect(menu({ grouped: true }).entries.map((entry) => entry.key)).not.toContain('group');
  });

  it('adds a level rather than replacing — the only route to a multi-column sort', () => {
    const { actions, byKey } = menu();
    byKey('sort-asc').onClick?.();
    expect(actions.onSortDir).toHaveBeenCalledWith('kind', 'asc');
    expect(actions.onToggleSort).not.toHaveBeenCalled();
  });

  it('offers BOTH directions while the column is unsorted, and neither removes anything', () => {
    const { entries, byKey, actions } = menu();
    const keys = entries.map((entry) => entry.key);
    expect(keys).toContain('sort-asc');
    expect(keys).toContain('sort-desc');
    expect(keys).not.toContain('sort-remove');
    expect(byKey('sort-asc').label).toBe('Sort ascending');
    expect(byKey('sort-desc').label).toBe('Sort descending');
    byKey('sort-desc').onClick?.();
    expect(actions.onSortDir).toHaveBeenCalledWith('kind', 'desc');
  });

  it('offers only the OTHER direction once the column sorts ascending', () => {
    const asc = menu({ sortDir: 'asc' });
    const keys = asc.entries.map((entry) => entry.key);
    expect(keys).toContain('sort-desc');
    expect(keys).not.toContain('sort-asc');
    asc.byKey('sort-desc').onClick?.();
    expect(asc.actions.onSortDir).toHaveBeenCalledWith('kind', 'desc');
  });

  it('offers only the OTHER direction once the column sorts descending', () => {
    const desc = menu({ sortDir: 'desc' });
    const keys = desc.entries.map((entry) => entry.key);
    expect(keys).toContain('sort-asc');
    expect(keys).not.toContain('sort-desc');
    desc.byKey('sort-asc').onClick?.();
    expect(desc.actions.onSortDir).toHaveBeenCalledWith('kind', 'asc');
  });

  it('keeps a per-column removal alongside it, naming the direction it drops', () => {
    const asc = menu({ sortDir: 'asc' });
    expect(asc.byKey('sort-remove').label).toBe('Remove sort on this column (ascending)');
    asc.byKey('sort-remove').onClick?.();
    expect(asc.actions.onRemoveSort).toHaveBeenCalledWith('kind');
    expect(asc.actions.onSortDir).not.toHaveBeenCalled();

    expect(menu({ sortDir: 'desc' }).byKey('sort-remove').label)
      .toBe('Remove sort on this column (descending)');
  });

  it('closes before it acts, so the menu never lingers over its own change', () => {
    const { actions, byKey, onClose } = menu();
    byKey('remove').onClick?.();
    expect(onClose).toHaveBeenCalled();
    expect(actions.onRemove).toHaveBeenCalledWith('kind');
  });

  it('hands renaming back to the header cell rather than doing it itself', () => {
    const { actions, byKey, onStartRename } = menu();
    byKey('rename').onClick?.();
    expect(onStartRename).toHaveBeenCalled();
    expect(actions.onRename).not.toHaveBeenCalled();
  });
});

/** Every acting entry a submenu tree hides, at whatever depth it sits. */
const flattenLeaves = (items: readonly MenuItem[]): MenuItem[] =>
  items.flatMap((item) => (item.children ? flattenLeaves(item.children) : [item]));

const leafAt = (items: readonly MenuItem[], key: string): MenuItem => {
  const found = flattenLeaves(items).find((item) => item.key === key);
  if (!found) throw new Error(`no entry ${key}`);
  return found;
};

describe('ColumnMenu — adding a column before or after this one', () => {
  const nodes = buildPickerNodes(NESTED, ['id']);
  const addMenu = (overrides: Partial<Parameters<typeof buildColumnMenuItems>[0]> = {}) =>
    menu({ fieldNodes: nodes, ...overrides });

  it('offers both, each opening the field tree as a submenu rather than a panel', () => {
    const { byKey } = addMenu();
    expect(byKey('add-before').children?.map((child) => child.key)).toEqual(['outer', 'tags']);
    expect(byKey('add-after').children?.map((child) => child.key)).toEqual(['outer', 'tags']);
    // A branch opens further; only a leaf acts.
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

  it('says so, greyed, rather than opening onto nothing when every field is shown', () => {
    const [empty] = menu({ fieldNodes: [] }).byKey('add-before').children ?? [];
    expect(empty.disabled).toBe(true);
    expect(empty.onClick).toBeUndefined();
  });
});

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

describe('the footer menu — what belongs to the table rather than a column', () => {
  it('holds the three that used to be repeated in every column, the fit-all and one add', () => {
    expect(tableMenu().entries.map((entry) => entry.key))
      .toEqual(['add-column', 'clear-sort', 'clear-group', 'fit-all', 'reset']);
  });

  /*
   * Placing a column is a column's own business — before this one, after this
   * one. This entry exists for the two cases no column menu can serve: not
   * caring where it lands, and a table with no columns left to open a menu on.
   */
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

  it('never greys the fit-all out — there is always something to fit', () => {
    expect(tableMenu().byKey('fit-all').disabled).toBeUndefined();
  });

  it('greys out clearing what is not set', () => {
    expect(tableMenu().byKey('clear-sort').disabled).toBe(true);
    expect(tableMenu().byKey('clear-group').disabled).toBe(true);
    expect(tableMenu({ sortActive: true }).byKey('clear-sort').disabled).toBe(false);
    expect(tableMenu({ groupActive: true }).byKey('clear-group').disabled).toBe(false);
  });

  it('never greys out the reset — a layout can always go back to its default', () => {
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
