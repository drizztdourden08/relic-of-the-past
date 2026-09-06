/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { buildSchema, createSchemaIndex } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import { createClause } from '../../apps/web/src/ui/design-system/data/filter/clause';
import type { TableState } from '../../apps/web/src/ui/design-system/data/table/types';
import {
  capture, emptySnapshot, isViewSnapshot, restore,
} from '../../apps/web/src/ui/design-system/data/view-state/snapshot';
import type { ViewSnapshot } from '../../apps/web/src/ui/design-system/data/view-state/snapshot';
import { prune } from '../../apps/web/src/ui/design-system/data/view-state/prune';

// A snapshot stores field paths, and a dataset changes shape underneath them.
// Restoring must always prune, never throw, and never leave a table with no
// columns at all.

const ROWS = [
  { id: 'item-001', name: 'alpha', size: 1, tag: 'red' },
  { id: 'item-002', name: 'beta', size: 5, tag: 'blue' },
];

// `name` is forced to a string so the operator-revalidation case below has a
// field where `contains` is legitimate, next to `tag` where it is not.
const CONFIG = { kinds: { name: 'string' } } as const;
const schema = createSchemaIndex(buildSchema(ROWS, CONFIG));

const TABLE: TableState = {
  columns: [{ path: 'id' }, { path: 'name', label: 'Title', width: 200 }],
  sort: [{ path: 'name', dir: 'desc' }],
  groupBy: ['tag'],
};

describe('capture and restore make one memento round trip', () => {
  it('carries the whole arrangement out and back', () => {
    const filters = [createClause('name', 'contains', 'a')];
    const snapshot = capture(TABLE, filters, 'editor');
    const restored = restore(snapshot);
    expect(restored.table).toEqual(TABLE);
    expect(restored.filters).toEqual(filters);
    expect(restored.tab).toBe('editor');
  });

  it('stamps a version so a future shape change can discard instead of migrate', () => {
    expect(capture(TABLE, []).v).toBe(1);
  });

  it('leaves the tab out entirely when there is none', () => {
    expect('tab' in capture(TABLE, [])).toBe(false);
  });

  // The Data Inspector's fold state (CollapsibleDetail) persists through the
  // same snapshot as the filters and the tab, keyed per collection.
  it('carries the collapsed flag out and back, alongside the tab', () => {
    const snapshot = capture(TABLE, [], 'json', true);
    expect(snapshot.collapsed).toBe(true);
    expect(restore(snapshot).collapsed).toBe(true);
  });

  it('leaves the collapsed flag out entirely when there is none', () => {
    expect('collapsed' in capture(TABLE, [])).toBe(false);
    expect('collapsed' in restore(capture(TABLE, []))).toBe(false);
  });

  it('copies instead of aliases, so later edits cannot reach back in', () => {
    const snapshot = capture(TABLE, [createClause('name', 'contains', 'a')]);
    expect(snapshot.columns[0]).not.toBe(TABLE.columns[0]);
    expect(restore(snapshot).table.columns[0]).not.toBe(snapshot.columns[0]);
  });

  it('recognises a well-formed snapshot and rejects everything else', () => {
    expect(isViewSnapshot(capture(TABLE, []))).toBe(true);
    expect(isViewSnapshot(emptySnapshot())).toBe(true);
    expect(isViewSnapshot(null)).toBe(false);
    expect(isViewSnapshot({})).toBe(false);
    expect(isViewSnapshot({ ...capture(TABLE, []), v: 2 })).toBe(false);
    expect(isViewSnapshot({ ...capture(TABLE, []), columns: 'nope' })).toBe(false);
  });
});

describe('prune after schema drift', () => {
  const stale: ViewSnapshot = {
    v: 1,
    columns: [{ path: 'id' }, { path: 'gone' }, { path: 'name' }],
    sort: [{ path: 'name', dir: 'asc' }, { path: 'gone', dir: 'asc' }],
    groupBy: ['tag', 'gone'],
    filters: [
      createClause('name', 'contains', 'a'),
      createClause('gone', 'contains', 'a'),
    ],
  };

  it('drops columns whose path no longer resolves', () => {
    expect(prune(stale, schema, [{ path: 'id' }]).columns.map((c) => c.path)).toEqual(['id', 'name']);
  });

  it('drops stale sort levels and stale grouping levels', () => {
    const pruned = prune(stale, schema, [{ path: 'id' }]);
    expect(pruned.sort.map((s) => s.path)).toEqual(['name']);
    expect(pruned.groupBy).toEqual(['tag']);
  });

  it('drops a filter whose path is gone', () => {
    expect(prune(stale, schema, [{ path: 'id' }]).filters.map((f) => f.path)).toEqual(['name']);
  });

  it('drops a filter whose operator no longer suits the field kind', () => {
    // `tag` reads as an enum here, so a string operator is no longer evaluable.
    const snapshot: ViewSnapshot = {
      ...emptySnapshot(),
      columns: [{ path: 'id' }],
      filters: [createClause('tag', 'contains', 'red'), createClause('tag', 'anyOf', ['red'])],
    };
    expect(schema.byPath('tag')?.kind).toBe('enum');
    expect(prune(snapshot, schema, [{ path: 'id' }]).filters.map((f) => f.op)).toEqual(['anyOf']);
  });

  it('falls back to the given columns instead of leaving the table empty', () => {
    const allStale: ViewSnapshot = { ...emptySnapshot(), columns: [{ path: 'gone' }, { path: 'also-gone' }] };
    expect(prune(allStale, schema, [{ path: 'id' }, { path: 'name' }]).columns)
      .toEqual([{ path: 'id' }, { path: 'name' }]);
  });

  it('falls back for a snapshot that had no columns to begin with', () => {
    expect(prune(emptySnapshot(), schema, [{ path: 'id' }]).columns).toEqual([{ path: 'id' }]);
  });

  it('leaves a snapshot that still fits entirely alone', () => {
    const fresh = capture(TABLE, [createClause('name', 'contains', 'a')], 'json');
    expect(prune(fresh, schema, [{ path: 'id' }])).toEqual(fresh);
  });

  it('accepts a raw field list and an index', () => {
    expect(prune(stale, buildSchema(ROWS, CONFIG), [{ path: 'id' }]).columns.map((c) => c.path))
      .toEqual(['id', 'name']);
  });

  it('prunes against a nested path, not just a top-level one', () => {
    const nested = createSchemaIndex(buildSchema([{ outer: { inner: 1 } }]));
    const snapshot: ViewSnapshot = {
      ...emptySnapshot(),
      columns: [{ path: 'outer.inner' }, { path: 'outer.missing' }],
    };
    expect(prune(snapshot, nested, []).columns).toEqual([{ path: 'outer.inner' }]);
  });
});
