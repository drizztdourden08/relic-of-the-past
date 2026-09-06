/* @layer tests @kind test */
import { describe, it, expect, vi } from 'vitest';
import { buildSchema, createSchemaIndex } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import { dedupeClauseIds, restoreDurableSnapshot } from '../../apps/web/src/ui/design-system/data/view-state/durable-load';
import { capture } from '../../apps/web/src/ui/design-system/data/view-state/snapshot';
import type { FilterClause } from '../../apps/web/src/ui/design-system/data/filter/clause';
import type { TableState, ViewSnapshot } from '../../apps/web/src/ui/design-system/data/view-state/snapshot';

// The reported bug: a delete that removes the wrong clause, or two, or a filter
// that changes when another was touched. `createClause` handed out ids from a
// module-level counter (`clause-1`, `clause-2`, ...) that reset on relaunch,
// while clause ids persist to disk verbatim (snapshot.ts's `capture`). The first
// clause of a fresh session collided with a saved one, and FilterBar keys
// add/remove/update off `clause.id` (clause-list.ts).
//
// The fix: `createClause` uses `crypto.randomUUID()`, and `restoreDurableSnapshot`
// heals a disk file that already has a collision by reassigning repeat ids.

const ROWS = [{ id: 'item-001', name: 'alpha' }];
// Forced instead of inferred: a single row's `name` would otherwise read as a
// one-value closed set (kind 'enum'), which does not offer the 'eq' operator
// these fixture clauses use. filter-clause.test.ts carries the same override.
const schema = createSchemaIndex(buildSchema(ROWS, { kinds: { name: 'string' } }));
const NO_TABLE: TableState = { columns: [], sort: [], groupBy: [] };

const withFilters = (...filters: readonly FilterClause[]): ViewSnapshot => capture(NO_TABLE, filters);

describe('createClause ids survive a relaunch', () => {
  it('never repeats an id across a fresh module evaluation, the way a real relaunch re-evaluates it', async () => {
    vi.resetModules();
    const first = await import('../../apps/web/src/ui/design-system/data/filter/clause');
    const persistedAcrossSessions = first.createClause('name', 'contains', 'a');

    // A relaunch re-evaluates every module from scratch, and this stands in for that,
    // the same way the old per-session counter would have reset to 0 here.
    vi.resetModules();
    const second = await import('../../apps/web/src/ui/design-system/data/filter/clause');
    const freshlyAddedThisSession = second.createClause('size', 'gt', 5);

    expect(freshlyAddedThisSession.id).not.toBe(persistedAcrossSessions.id);
  });

  it('gives many clauses created back-to-back all-distinct ids', () => {
    const ids = new Set(Array.from({ length: 50 }, () => crypto.randomUUID()));
    expect(ids.size).toBe(50);
  });
});

describe('dedupeClauseIds heals a disk file from before the fix', () => {
  it('leaves a list with no duplicates alone', () => {
    const clauses = [
      { id: 'a', path: 'name', op: 'eq', value: 1, enabled: true },
      { id: 'b', path: 'name', op: 'eq', value: 2, enabled: true },
    ];
    expect(dedupeClauseIds(clauses)).toEqual(clauses);
  });

  it('reassigns a fresh id to every repeat of a duplicated id, keeping the first occurrence as-is', () => {
    const first = { id: 'clause-1', path: 'name', op: 'eq', value: 'alpha', enabled: true };
    const collided = { id: 'clause-1', path: 'size', op: 'gt', value: 5, enabled: true };
    const result = dedupeClauseIds([first, collided]);

    expect(result[0]).toBe(first);
    expect(result[1].id).not.toBe('clause-1');
    // Everything about the collided clause other than its id survives the heal.
    expect(result[1]).toEqual({ ...collided, id: result[1].id });
  });

  it('gives duplicates distinct new ids, not just the same replacement twice', () => {
    const shared = 'clause-1';
    const clauses = [
      { id: shared, path: 'a', op: 'eq', value: 1, enabled: true },
      { id: shared, path: 'b', op: 'eq', value: 2, enabled: true },
      { id: shared, path: 'c', op: 'eq', value: 3, enabled: true },
    ];
    const result = dedupeClauseIds(clauses);
    expect(new Set(result.map((clause) => clause.id)).size).toBe(3);
  });
});

describe('restoreDurableSnapshot heals a collided disk snapshot end to end', () => {
  it('a loaded snapshot with a duplicate clause id comes back with every clause independently removable', () => {
    const shared = 'clause-1';
    const loaded: ViewSnapshot = withFilters(
      { id: shared, path: 'name', op: 'eq', value: 'alpha', enabled: true },
      { id: shared, path: 'name', op: 'eq', value: 'beta', enabled: true },
    );

    const restored = restoreDurableSnapshot(loaded, schema, []);
    expect(restored.filters).toHaveLength(2);

    const uniqueIds = new Set(restored.filters.map((clause) => clause.id));
    expect(uniqueIds.size).toBe(2);

    // Now that ids are unique, removing one really only removes one.
    const remaining = restored.filters.filter((clause) => clause.id !== restored.filters[0].id);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].value).toBe('beta');
  });
});
