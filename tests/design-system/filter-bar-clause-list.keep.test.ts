/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import {
  addClause, removeClause, updateClauseById,
} from '../../apps/web/src/ui/design-system/composites/FilterBar/behavior/clause-list';
import { createClause } from '../../apps/web/src/ui/design-system/data/filter/clause';
import type { FilterClause } from '../../apps/web/src/ui/design-system/data/filter/clause';

// FilterBar only wires these transitions to handlers (FilterBar.tsx); the
// logic lives here. Every clause is keyed by its own id, never array index,
// so these build lists out of order and interleave removals.

const clauseOn = (path: string, value: unknown): FilterClause => createClause(path, 'eq', value);

describe('addClause', () => {
  it('appends one clause to an empty list', () => {
    const a = clauseOn('name', 'alpha');
    expect(addClause([], a)).toEqual([a]);
  });

  it('appends without disturbing the clauses already there', () => {
    const a = clauseOn('name', 'alpha');
    const b = clauseOn('size', 5);
    const c = clauseOn('tag', 'red');
    const afterB = addClause([a], b);
    const afterC = addClause(afterB, c);
    expect(afterC.map((clause) => clause.id)).toEqual([a.id, b.id, c.id]);
    expect(afterC[0]).toBe(a);
    expect(afterC[1]).toBe(b);
  });

  it('gives every added clause its own id, even for the same path', () => {
    const first = addClause([], clauseOn('name', 'alpha'));
    const second = addClause(first, clauseOn('name', 'beta'));
    expect(second[0].id).not.toBe(second[1].id);
  });
});

describe('removeClause', () => {
  it('removes the one clause in a single-clause list', () => {
    const a = clauseOn('name', 'alpha');
    expect(removeClause([a], a.id)).toEqual([]);
  });

  it('removes a middle clause and leaves the others with their own values untouched', () => {
    const a = clauseOn('name', 'alpha');
    const b = clauseOn('size', 5);
    const c = clauseOn('tag', 'red');
    const result = removeClause([a, b, c], b.id);
    expect(result.map((clause) => clause.id)).toEqual([a.id, c.id]);
    expect(result[0].value).toBe('alpha');
    expect(result[1].value).toBe('red');
  });

  it('removing the last remaining clause empties the list instead of reverting to an earlier one', () => {
    const a = clauseOn('name', 'alpha');
    const afterFirstRemoval = removeClause([a, clauseOn('size', 5)], a.id);
    const afterSecondRemoval = removeClause(afterFirstRemoval, afterFirstRemoval[0].id);
    expect(afterSecondRemoval).toEqual([]);
  });

  it('is a no-op when the id is not present, instead of clearing the list', () => {
    const a = clauseOn('name', 'alpha');
    expect(removeClause([a], 'not-a-real-id')).toEqual([a]);
  });

  it('never removes more than the one matching id', () => {
    const clauses = [clauseOn('a', 1), clauseOn('b', 2), clauseOn('c', 3), clauseOn('d', 4)];
    const target = clauses[2];
    const result = removeClause(clauses, target.id);
    expect(result).toHaveLength(3);
    expect(result.some((clause) => clause.id === target.id)).toBe(false);
  });
});

describe('updateClauseById', () => {
  it('patches only the clause with the matching id', () => {
    const a = clauseOn('name', 'alpha');
    const b = clauseOn('size', 5);
    const result = updateClauseById([a, b], a.id, { value: 'renamed' });
    expect(result[0].value).toBe('renamed');
    expect(result[1]).toBe(b);
  });

  it('can toggle enabled without touching any other field', () => {
    const a = clauseOn('name', 'alpha');
    const result = updateClauseById([a], a.id, { enabled: false });
    expect(result[0]).toEqual({ ...a, enabled: false });
  });

  it('is a no-op when the id is not present', () => {
    const a = clauseOn('name', 'alpha');
    expect(updateClauseById([a], 'not-a-real-id', { value: 'x' })).toEqual([a]);
  });
});

describe('rapid add-then-remove-then-add sequences', () => {
  it('a fast add, remove, add on the same path ends with exactly one live clause', () => {
    let clauses: readonly FilterClause[] = [];
    const first = clauseOn('name', 'alpha');
    clauses = addClause(clauses, first);
    clauses = removeClause(clauses, first.id);
    const second = clauseOn('name', 'beta');
    clauses = addClause(clauses, second);

    expect(clauses).toHaveLength(1);
    expect(clauses[0].id).toBe(second.id);
    expect(clauses[0].value).toBe('beta');
  });

  it('interleaving add/remove across several clauses lands on the expected final set', () => {
    let clauses: readonly FilterClause[] = [];
    const a = clauseOn('a', 1);
    const b = clauseOn('b', 2);
    clauses = addClause(clauses, a);
    clauses = addClause(clauses, b);
    const c = clauseOn('c', 3);
    clauses = addClause(clauses, c);
    clauses = removeClause(clauses, a.id);
    const d = clauseOn('d', 4);
    clauses = addClause(clauses, d);
    clauses = removeClause(clauses, c.id);

    expect(clauses.map((clause) => clause.path)).toEqual(['b', 'd']);
  });

  it('removing every clause one at a time, fastest possible, always ends empty', () => {
    let clauses: readonly FilterClause[] = [clauseOn('a', 1), clauseOn('b', 2), clauseOn('c', 3)];
    for (const clause of [...clauses]) {
      clauses = removeClause(clauses, clause.id);
    }
    expect(clauses).toEqual([]);
  });
});
