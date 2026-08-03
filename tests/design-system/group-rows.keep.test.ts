/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { buildSchema, createSchemaIndex } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import { flattenGroups, groupRows } from '../../apps/web/src/ui/design-system/data/table/group-rows';
import type { GroupedRow } from '../../apps/web/src/ui/design-system/data/table/types';
import { deriveRows } from '../../apps/web/src/ui/design-system/data/table/derive-rows';
import { getPath } from '../../apps/web/src/ui/design-system/data/schema/path';

// Grouping nests: a group's children are either the next level or the rows
// themselves, so a renderer walks the tree and collapsing is a local decision.

interface Row { world: string; kind: string; id: string }

const ROWS: Row[] = [
  { world: 'a', kind: 'cave', id: '1' },
  { world: 'b', kind: 'cave', id: '2' },
  { world: 'a', kind: 'room', id: '3' },
  { world: 'a', kind: 'cave', id: '4' },
];

const keyFor = (path: string, row: Row): string => String(getPath(row, path));

const groups = <T>(nodes: readonly GroupedRow<T>[]) =>
  nodes.filter((n): n is Extract<GroupedRow<T>, { kind: 'group' }> => n.kind === 'group');

describe('groupRows', () => {
  it('returns plain row leaves when nothing is grouped', () => {
    const result = groupRows(ROWS, [], keyFor);
    expect(result).toHaveLength(4);
    expect(result.every((node) => node.kind === 'row')).toBe(true);
  });

  it('buckets by one level, in first-seen key order', () => {
    const result = groups(groupRows(ROWS, ['world'], keyFor));
    expect(result.map((g) => g.key)).toEqual(['a', 'b']);
    expect(result.map((g) => g.count)).toEqual([3, 1]);
    expect(result[0].level).toBe(0);
    expect(result[0].path).toBe('world');
  });

  it('nests a second level under the first', () => {
    const outer = groups(groupRows(ROWS, ['world', 'kind'], keyFor));
    expect(outer.map((g) => g.key)).toEqual(['a', 'b']);

    const inner = groups(outer[0].children);
    expect(inner.map((g) => g.key)).toEqual(['cave', 'room']);
    expect(inner.map((g) => g.count)).toEqual([2, 1]);
    expect(inner[0].level).toBe(1);
    expect(inner[0].path).toBe('kind');
  });

  it('puts the rows themselves at the innermost level', () => {
    const outer = groups(groupRows(ROWS, ['world', 'kind'], keyFor));
    const leaves = groups(outer[0].children)[0].children;
    expect(leaves.every((node) => node.kind === 'row')).toBe(true);
    expect(leaves.map((node) => (node.kind === 'row' ? node.row.id : ''))).toEqual(['1', '4']);
  });

  it('counts every leaf row beneath a node, not just its direct children', () => {
    const outer = groups(groupRows(ROWS, ['world', 'kind'], keyFor));
    expect(outer[0].count).toBe(3);
    expect(groups(outer[0].children).reduce((sum, g) => sum + g.count, 0)).toBe(3);
  });

  it('keeps every row, and only once, however deep the grouping', () => {
    for (const groupBy of [[], ['world'], ['world', 'kind'], ['kind', 'world']]) {
      expect(flattenGroups(groupRows(ROWS, groupBy, keyFor))).toHaveLength(ROWS.length);
    }
  });

  it('handles an empty row list', () => {
    expect(groupRows([], ['world'], keyFor)).toEqual([]);
  });
});

describe('grouping and sorting together', () => {
  const schema = createSchemaIndex(buildSchema(ROWS));

  it('orders groups by their key and rows within a group by the sort list', () => {
    const { groupedRows } = deriveRows({
      rows: ROWS, schema, sort: [{ path: 'id', dir: 'desc' }], groupBy: ['world'],
    });
    const outer = groups(groupedRows);
    expect(outer.map((g) => g.key)).toEqual(['a', 'b']);
    const first = outer[0].children.map((n) => (n.kind === 'row' ? n.row.id : ''));
    expect(first).toEqual(['4', '3', '1']);
  });

  it('keeps the flattened tree identical to the sorted row list', () => {
    const { sortedRows, groupedRows } = deriveRows({
      rows: ROWS, schema, sort: [{ path: 'id', dir: 'asc' }], groupBy: ['world', 'kind'],
    });
    expect(flattenGroups(groupedRows)).toEqual(sortedRows);
  });
});
