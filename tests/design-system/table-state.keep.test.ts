/* @layer tests @kind test */
import { describe, it, expect, beforeEach } from 'vitest';
import { buildSchema, createSchemaIndex } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import type { TableColumn, TableState } from '../../apps/web/src/ui/design-system/data/table/types';
import * as columnOps from '../../apps/web/src/ui/design-system/data/table/column-ops';
import * as sortOps from '../../apps/web/src/ui/design-system/data/table/sort-ops';
import { deriveRows } from '../../apps/web/src/ui/design-system/data/table/derive-rows';
import {
  clearFieldStrategies, getComparator, registerComparator,
} from '../../apps/web/src/ui/design-system/data/table/strategy-registry';
import { initialState } from '../../apps/web/src/ui/design-system/data/table/use-data-table';

// The hook is a thin binding over these transforms. There is no renderer in
// this test setup, so the transforms are exercised directly and the hook's
// sequences are replayed through them, which is the same state machine.

const ROWS = [
  { id: 'item-003', name: 'gamma', size: 9 },
  { id: 'item-001', name: 'alpha', size: 1 },
  { id: 'item-002', name: 'beta', size: 5 },
];

const schema = buildSchema(ROWS);
const index = createSchemaIndex(schema);
const paths = (state: TableState): string[] => state.columns.map((c) => c.path);

/** Replays what the hook's callbacks do: a pure transform over the previous state. */
const apply = (state: TableState, transform: (s: TableState) => TableState): TableState =>
  transform(state);

describe('initial table state', () => {
  it('shows every visible top-level field when no initial set is given', () => {
    expect(paths(initialState(schema))).toEqual(['id', 'name', 'size']);
  });

  it('honours an explicit initial column set, in that order', () => {
    expect(paths(initialState(schema, [{ path: 'size' }, { path: 'id' }]))).toEqual(['size', 'id']);
  });

  it('leaves out a field the config hid', () => {
    expect(paths(initialState(buildSchema(ROWS, { hidden: ['name'] })))).toEqual(['id', 'size']);
  });

  it('starts unsorted and ungrouped', () => {
    expect(initialState(schema).sort).toEqual([]);
    expect(initialState(schema).groupBy).toEqual([]);
  });

  it('opens every default column in the persistent fit-to-content mode, not the automatic range', () => {
    expect(initialState(schema).columns).toEqual([
      { path: 'id', fit: true }, { path: 'name', fit: true }, { path: 'size', fit: true },
    ]);
  });
});

describe('columns can be added, removed, moved and renamed', () => {
  let state: TableState;
  beforeEach(() => {
    state = initialState(schema);
  });

  it('appends an added column to the right', () => {
    state = apply(state, (s) => ({ ...s, columns: columnOps.addColumn(s.columns, 'extra') }));
    expect(paths(state)).toEqual(['id', 'name', 'size', 'extra']);
  });

  it('does not add the same column twice', () => {
    const next = columnOps.addColumn(state.columns, 'id');
    expect(next).toBe(state.columns);
  });

  // The insertion index "add column before / after" computes: N lands in
  // front of column N, N + 1 behind. Both are where the NEW column ends up.
  it('inserts before a column, which is that column\'s own index', () => {
    // state.columns is [id, name, size]; "before name" is index 1.
    expect(columnOps.insertColumnAt(state.columns, 'extra', 1).map((c) => c.path))
      .toEqual(['id', 'extra', 'name', 'size']);
  });

  it('inserts after a column, which is one past its own index', () => {
    // "after name" means name is index 1, so the new column lands at 2.
    expect(columnOps.insertColumnAt(state.columns, 'extra', 2).map((c) => c.path))
      .toEqual(['id', 'name', 'extra', 'size']);
  });

  it('puts "before the first" at the front and "after the last" at the back', () => {
    expect(columnOps.insertColumnAt(state.columns, 'extra', 0).map((c) => c.path))
      .toEqual(['extra', 'id', 'name', 'size']);
    expect(columnOps.insertColumnAt(state.columns, 'extra', 3).map((c) => c.path))
      .toEqual(['id', 'name', 'size', 'extra']);
  });

  it('clamps an index past either end instead of dropping the column', () => {
    expect(columnOps.insertColumnAt(state.columns, 'extra', 99).map((c) => c.path))
      .toEqual(['id', 'name', 'size', 'extra']);
    expect(columnOps.insertColumnAt(state.columns, 'extra', -4).map((c) => c.path))
      .toEqual(['extra', 'id', 'name', 'size']);
  });

  it('is a no-op for a column already shown, wherever it was asked to go', () => {
    expect(columnOps.insertColumnAt(state.columns, 'size', 0)).toBe(state.columns);
  });

  it('removes a column and leaves the rest in order', () => {
    expect(columnOps.removeColumn(state.columns, 'name').map((c) => c.path)).toEqual(['id', 'size']);
  });

  it('moves a column left and right', () => {
    expect(columnOps.moveColumn(state.columns, 'size', 'left').map((c) => c.path)).toEqual(['id', 'size', 'name']);
    expect(columnOps.moveColumn(state.columns, 'id', 'right').map((c) => c.path)).toEqual(['name', 'id', 'size']);
  });

  it('moves a column to first and last', () => {
    expect(columnOps.moveColumn(state.columns, 'size', 'first').map((c) => c.path)).toEqual(['size', 'id', 'name']);
    expect(columnOps.moveColumn(state.columns, 'id', 'last').map((c) => c.path)).toEqual(['name', 'size', 'id']);
  });

  it('clamps a move at either end instead of wrapping', () => {
    expect(columnOps.moveColumn(state.columns, 'id', 'left')).toBe(state.columns);
    expect(columnOps.moveColumn(state.columns, 'size', 'right')).toBe(state.columns);
  });

  it('ignores a move of a column that is not shown', () => {
    expect(columnOps.moveColumn(state.columns, 'absent', 'first')).toBe(state.columns);
  });

  it('reorders to an explicit index, the way a drag drops', () => {
    expect(columnOps.reorderColumn(state.columns, 'size', 0).map((c) => c.path)).toEqual(['size', 'id', 'name']);
    expect(columnOps.reorderColumn(state.columns, 'id', 9)).toBe(state.columns);
  });

  it('renames a column visually, keeping the path as the identity', () => {
    const renamed = columnOps.renameColumn(state.columns, 'name', 'Title');
    expect(renamed[1]).toEqual({ path: 'name', fit: true, label: 'Title' });
    expect(columnOps.renameColumn(renamed, 'name', '')[1]).toEqual({ path: 'name', fit: true });
  });

  it('records a width', () => {
    expect(columnOps.resizeColumn(state.columns, 'id', 240)[0].width).toBe(240);
  });

  it('adds a new column already in the persistent fit-to-content mode', () => {
    expect(columnOps.addColumn(state.columns, 'extra')[3]).toEqual({ path: 'extra', fit: true });
    expect(columnOps.insertColumnAt(state.columns, 'extra', 0)[0]).toEqual({ path: 'extra', fit: true });
  });
});

describe('width, grow and fit are one setting in three forms', () => {
  const columns: readonly TableColumn[] = [{ path: 'id' }, { path: 'kind' }];

  it('turns on persistent fit-to-content, clearing any width or grow', () => {
    const grown = columnOps.growColumn(columns, 'kind');
    expect(columnOps.fitColumn(grown, 'kind')).toEqual([{ path: 'id' }, { path: 'kind', fit: true }]);
    const sized = columnOps.resizeColumn(columns, 'kind', 200);
    expect(columnOps.fitColumn(sized, 'kind')).toEqual([{ path: 'id' }, { path: 'kind', fit: true }]);
  });

  it('drops fit the moment a width or a grow is set instead', () => {
    const fitted = columnOps.fitColumn(columns, 'kind');
    expect(columnOps.resizeColumn(fitted, 'kind', 240)[1]).toEqual({ path: 'kind', width: 240 });
    expect(columnOps.growColumn(fitted, 'kind')[1]).toEqual({ path: 'kind', grow: true });
  });

  it('turns on fit-to-content for every column at once, from the footer', () => {
    const mixed: readonly TableColumn[] = [
      { path: 'id', width: 100 }, { path: 'kind', grow: true }, { path: 'note' },
    ];
    expect(columnOps.fitAllColumns(mixed)).toEqual([
      { path: 'id', fit: true }, { path: 'kind', fit: true }, { path: 'note', fit: true },
    ]);
  });
});

describe('sorting where a header click replaces and a menu names a direction', () => {
  it('cycles one column asc then desc then off', () => {
    let sort = sortOps.setSingleSort([], 'name');
    expect(sort).toEqual([{ path: 'name', dir: 'asc' }]);
    sort = sortOps.setSingleSort(sort, 'name');
    expect(sort).toEqual([{ path: 'name', dir: 'desc' }]);
    sort = sortOps.setSingleSort(sort, 'name');
    expect(sort).toEqual([]);
  });

  it('replaces the whole list when a different header is clicked', () => {
    const sort = sortOps.setSingleSort([{ path: 'name', dir: 'desc' }], 'size');
    expect(sort).toEqual([{ path: 'size', dir: 'asc' }]);
  });

  it('restarts the cycle instead of continuing it when several columns are sorted', () => {
    const multi = [{ path: 'name', dir: 'asc' as const }, { path: 'size', dir: 'asc' as const }];
    expect(sortOps.setSingleSort(multi, 'name')).toEqual([{ path: 'name', dir: 'asc' }]);
  });

  it('adds a second sort level instead of replacing', () => {
    const sort = sortOps.setSortDir([{ path: 'name', dir: 'asc' }], 'size', 'asc');
    expect(sort).toEqual([{ path: 'name', dir: 'asc' }, { path: 'size', dir: 'asc' }]);
    expect(sortOps.setSortDir([{ path: 'name', dir: 'asc' }], 'size', 'desc'))
      .toEqual([{ path: 'name', dir: 'asc' }, { path: 'size', dir: 'desc' }]);
  });

  it('rewrites the direction of a level already in the list, keeping its rank', () => {
    const multi = [{ path: 'name', dir: 'asc' as const }, { path: 'size', dir: 'asc' as const }];
    expect(sortOps.setSortDir(multi, 'name', 'desc'))
      .toEqual([{ path: 'name', dir: 'desc' }, { path: 'size', dir: 'asc' }]);
  });

  it('never flips, because the caller has already said which way, so asking twice is idempotent', () => {
    const once = sortOps.setSortDir([], 'name', 'desc');
    expect(sortOps.setSortDir(once, 'name', 'desc')).toEqual([{ path: 'name', dir: 'desc' }]);
  });

  it('removes one level and leaves the others', () => {
    const sort = sortOps.removeSort([{ path: 'name', dir: 'asc' }, { path: 'size', dir: 'asc' }], 'name');
    expect(sort).toEqual([{ path: 'size', dir: 'asc' }]);
  });
});

describe('derived rows', () => {
  beforeEach(() => clearFieldStrategies());

  it('leaves the rows alone when nothing is sorted', () => {
    const { sortedRows } = deriveRows({ rows: ROWS, schema: index, sort: [], groupBy: [] });
    expect(sortedRows).toBe(ROWS);
  });

  it('sorts by the generic fallback when no comparator is registered', () => {
    const { sortedRows } = deriveRows({
      rows: ROWS, schema: index, sort: [{ path: 'name', dir: 'asc' }], groupBy: [],
    });
    expect(sortedRows.map((r) => r.name)).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('reverses for a descending sort', () => {
    const { sortedRows } = deriveRows({
      rows: ROWS, schema: index, sort: [{ path: 'name', dir: 'desc' }], groupBy: [],
    });
    expect(sortedRows.map((r) => r.name)).toEqual(['gamma', 'beta', 'alpha']);
  });

  it('uses a registered comparator in preference to the fallback', () => {
    // The fallback compares stringified values, so 9 would sort before 10.
    const rows = [{ size: 10 }, { size: 9 }];
    const numeric = createSchemaIndex(buildSchema(rows));
    expect(deriveRows({ rows, schema: numeric, sort: [{ path: 'size', dir: 'asc' }], groupBy: [] })
      .sortedRows.map((r) => r.size)).toEqual([10, 9]);
    registerComparator('number', (a, b) => Number(a) - Number(b));
    expect(deriveRows({ rows, schema: numeric, sort: [{ path: 'size', dir: 'asc' }], groupBy: [] })
      .sortedRows.map((r) => r.size)).toEqual([9, 10]);
  });

  it('always resolves a comparator, registered or not', () => {
    expect(typeof getComparator('unknown')).toBe('function');
    expect(getComparator('unknown')(undefined, 'a')).toBe(1);
    expect(getComparator('unknown')('a', undefined)).toBe(-1);
  });
});
