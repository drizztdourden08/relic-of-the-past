/* @layer tests @kind test */
import { describe, it, expect, beforeEach } from 'vitest';
import { buildSchema, createSchemaIndex } from '../../../apps/web/src/ui/design-system/data/schema/build-schema';
import * as sortOps from '../../../apps/web/src/ui/design-system/data/table/sort-ops';
import { deriveRows } from '../../../apps/web/src/ui/design-system/data/table/derive-rows';
import {
  clearFieldStrategies, getComparator, registerComparator,
} from '../../../apps/web/src/ui/design-system/data/table/strategy-registry';
import { ROWS } from './table-state.constants';

const index = createSchemaIndex(buildSchema(ROWS));

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
