/* @layer tests @kind test */
import { describe, it, expect, beforeEach } from 'vitest';
import { buildSchema } from '../../../apps/web/src/ui/design-system/data/schema/build-schema';
import type { TableColumn, TableState } from '../../../apps/web/src/ui/design-system/data/table/types';
import * as columnOps from '../../../apps/web/src/ui/design-system/data/table/column-ops';
import { initialState } from '../../../apps/web/src/ui/design-system/data/table/use-data-table';
import { ROWS } from './table-state.constants';

const schema = buildSchema(ROWS);
const paths = (state: TableState): string[] => state.columns.map((c) => c.path);

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

  it('inserts before a column, which is that column\'s own index', () => {
    const beforeName = 1;
    expect(columnOps.insertColumnAt(state.columns, 'extra', beforeName).map((c) => c.path))
      .toEqual(['id', 'extra', 'name', 'size']);
  });

  it('inserts after a column, which is one past its own index', () => {
    const afterName = 2;
    expect(columnOps.insertColumnAt(state.columns, 'extra', afterName).map((c) => c.path))
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
