/* @layer tests @kind test */
import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import { addClause, removeClause } from '../../apps/web/src/ui/design-system/composites/FilterBar/behavior/clause-list';
import { buildSchema, createSchemaIndex } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import { createClause } from '../../apps/web/src/ui/design-system/data/filter/clause';
import { capture } from '../../apps/web/src/ui/design-system/data/view-state/snapshot';
import type { FilterClause } from '../../apps/web/src/ui/design-system/data/filter/clause';
import type { TableState, ViewKey, ViewSnapshot } from '../../apps/web/src/ui/design-system/data/view-state/snapshot';

// The debounced write path end to end: what a rapid add/remove/add sequence
// leaves on disk once the 400ms debounce (lib/storage/ui-views.ts) flushes.
// Nothing mocks `saveViewSnapshot`/`loadViewSnapshot`: the reported bug
// ("filters being added without me doing it") was live persistence, so this
// uses the real repository like view-state-load-race.test.ts, for the write side.

const KEY = 'data-inspector-query:screen' as ViewKey;
const ROWS = [{ id: 'item-001', name: 'alpha' }];
const schema = createSchemaIndex(buildSchema(ROWS));
const NO_TABLE: TableState = { columns: [], sort: [], groupBy: [] };

const snapshotOf = (filters: readonly FilterClause[]): ViewSnapshot => capture(NO_TABLE, filters);

let load: ReturnType<typeof vi.fn>;
let save: ReturnType<typeof vi.fn>;
let loadViewSnapshot: (key: ViewKey) => Promise<ViewSnapshot | undefined>;
let saveViewSnapshot: (key: ViewKey, snapshot: ViewSnapshot) => void;

beforeEach(async () => {
  vi.resetModules();
  load = vi.fn().mockResolvedValue({});
  save = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('window', {
    api: { uiViews: { load, save } },
    addEventListener: () => {},
    removeEventListener: () => {},
  });
  vi.useFakeTimers();
  ({ loadViewSnapshot, saveViewSnapshot } = await import('../../apps/web/src/lib/storage/ui-views'));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('a full add/remove sequence round-trips through the disk repository', () => {
  it('writes back exactly the clauses left after add, add, remove-middle', async () => {
    let clauses: readonly FilterClause[] = [];
    const a = createClause('name', 'eq', 'alpha');
    const b = createClause('name', 'eq', 'beta');
    clauses = addClause(clauses, a);
    saveViewSnapshot(KEY, snapshotOf(clauses));
    clauses = addClause(clauses, b);
    saveViewSnapshot(KEY, snapshotOf(clauses));
    clauses = removeClause(clauses, a.id);
    saveViewSnapshot(KEY, snapshotOf(clauses));

    await vi.advanceTimersByTimeAsync(400);

    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0][0][KEY].filters).toEqual([b]);
  });

  it('a rapid add-then-remove-then-add, all inside one debounce window, saves only the survivor', async () => {
    let clauses: readonly FilterClause[] = [];
    const first = createClause('name', 'eq', 'alpha');
    clauses = addClause(clauses, first);
    saveViewSnapshot(KEY, snapshotOf(clauses));

    clauses = removeClause(clauses, first.id);
    saveViewSnapshot(KEY, snapshotOf(clauses));

    const second = createClause('name', 'eq', 'beta');
    clauses = addClause(clauses, second);
    saveViewSnapshot(KEY, snapshotOf(clauses));

    await vi.advanceTimersByTimeAsync(400);

    expect(save).toHaveBeenCalledTimes(1);
    const written = save.mock.calls[0][0][KEY].filters;
    expect(written).toHaveLength(1);
    expect(written[0].id).toBe(second.id);
    expect(written[0].value).toBe('beta');
  });

  it('removing the last clause writes an empty list, not the previous non-empty one', async () => {
    const only = createClause('name', 'eq', 'alpha');
    saveViewSnapshot(KEY, snapshotOf([only]));
    saveViewSnapshot(KEY, snapshotOf(removeClause([only], only.id)));

    await vi.advanceTimersByTimeAsync(400);

    expect(save.mock.calls[0][0][KEY].filters).toEqual([]);
  });

  it('what was saved is exactly what a fresh load hands back, with nothing added and nothing dropped', async () => {
    const kept = [createClause('name', 'eq', 'alpha'), createClause('name', 'eq', 'beta')];
    saveViewSnapshot(KEY, snapshotOf(kept));
    await vi.advanceTimersByTimeAsync(400);

    const writtenMap = save.mock.calls[0][0];
    // Simulate the next launch: a cold module, reading back exactly what got written.
    vi.resetModules();
    load = vi.fn().mockResolvedValue(writtenMap);
    save = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('window', {
      api: { uiViews: { load, save } },
      addEventListener: () => {},
      removeEventListener: () => {},
    });
    ({ loadViewSnapshot } = await import('../../apps/web/src/lib/storage/ui-views'));

    const reloaded = await loadViewSnapshot(KEY);
    expect(reloaded?.filters).toEqual(kept);
  });
});
