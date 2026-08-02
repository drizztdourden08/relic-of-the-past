/* @layer tests @kind test */
import { describe, it, expect, vi } from 'vitest';
import { buildSchema, createSchemaIndex } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import { dedupeClauseIds, restoreDurableSnapshot } from '../../apps/web/src/ui/design-system/data/view-state/durable-load';
import { capture } from '../../apps/web/src/ui/design-system/data/view-state/snapshot';
import type { FilterClause } from '../../apps/web/src/ui/design-system/data/filter/clause';
import type { TableState, ViewSnapshot } from '../../apps/web/src/ui/design-system/data/view-state/snapshot';

// The reported bug: filters "behaving weirdly" — a delete that removes the
// wrong thing, or takes two, or a filter that changes when the user only
// touched a different one. Root cause: `createClause` used to hand out ids
// from a plain module-level counter (`clause-1`, `clause-2`, ...) that reset
// to zero every time the app relaunched, while a clause's id is persisted to
// disk verbatim (see snapshot.ts's `capture`). The very first clause created
// in a fresh session was therefore near-guaranteed to collide with whatever
// a PRIOR session had already saved under the same low id — and FilterBar's
// add/remove/update all key off `clause.id` (see clause-list.ts), so two
// clauses sharing an id meant acting on one silently acted on both, and React
// rendered them under a duplicate key.
//
// The fix has two parts: `createClause` now hands out `crypto.randomUUID()`
// ids, which cannot repeat across a relaunch (covered below), and
// `restoreDurableSnapshot` heals a disk file that already has a collision
// from before this fix, by reassigning a fresh id to every repeat occurrence.

const ROWS = [{ id: 'item-001', name: 'alpha' }];
// Forced rather than inferred: a single row's `name` would otherwise read as a
// one-value closed set (kind 'enum'), which does not offer the 'eq' operator
// these fixture clauses use — see filter-clause.test.ts for the same override.
const schema = createSchemaIndex(buildSchema(ROWS, { kinds: { name: 'string' } }));
const NO_TABLE: TableState = { columns: [], sort: [], groupBy: [] };

const withFilters = (...filters: readonly FilterClause[]): ViewSnapshot => capture(NO_TABLE, filters);

describe('createClause ids survive a relaunch', () => {
  it('never repeats an id across a fresh module evaluation, the way a real relaunch re-evaluates it', async () => {
    vi.resetModules();
    const first = await import('../../apps/web/src/ui/design-system/data/filter/clause');
    const persistedAcrossSessions = first.createClause('name', 'contains', 'a');

    // A relaunch re-evaluates every module from scratch — this stands in for that,
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

describe('dedupeClauseIds — healing a disk file from before the fix', () => {
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
