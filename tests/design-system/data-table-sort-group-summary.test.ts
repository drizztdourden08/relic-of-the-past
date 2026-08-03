/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import {
  summarizeSortGroup, summaryLine,
} from '../../apps/web/src/ui/design-system/composites/DataTable/behavior/sort-group-summary';
import type { SortEntry } from '../../apps/web/src/ui/design-system/data/table/types';

// The header used to carry a rank number beside its caret and a flag glyph
// beside a grouped column's name, then a read-only sentence at the top of
// every column's own ⋯ menu. Both are gone; what is left is one sentence,
// worded here and shown once, at the bottom-left of the table (see
// `TableFooter` and `data-table-render.test.ts`). That sentence is pure text,
// so it is asserted here directly — no DOM involved, which is the reason it
// was built as a pure function.

/** Titles the way a header spells them, so the sentence reads like the table. */
const TITLES: Record<string, string | undefined> = {
  kind: 'Kind',
  status: 'Status',
  world: 'World',
  'placement.side': 'Side',
};

const labelOf = (path: string): string => TITLES[path] ?? path;

const summarize = (sort: readonly SortEntry[], groupBy: readonly string[] = []) =>
  summarizeSortGroup({ sort, groupBy, labelOf });

describe('the sort sentence', () => {
  it('says nothing at all when the table is in its natural order', () => {
    expect(summarize([]).sorted).toBeUndefined();
  });

  it('names the direction, and no rank, for a single sort level', () => {
    expect(summarize([{ path: 'kind', dir: 'asc' }]).sorted).toBe('Sorted: Kind (ascending)');
    expect(summarize([{ path: 'world', dir: 'desc' }]).sorted).toBe('Sorted: World (descending)');
  });

  it('numbers the levels once there is more than one, in the order they apply', () => {
    expect(summarize([
      { path: 'kind', dir: 'desc' },
      { path: 'status', dir: 'asc' },
    ]).sorted).toBe('Sorted: Kind (1st, descending), Status (2nd, ascending)');
  });

  it('keeps numbering past the second level', () => {
    expect(summarize([
      { path: 'world', dir: 'asc' },
      { path: 'kind', dir: 'asc' },
      { path: 'status', dir: 'desc' },
    ]).sorted).toBe('Sorted: World (1st, ascending), Kind (2nd, ascending), Status (3rd, descending)');
  });

  it('spells a nested path the way its header does, renames and all', () => {
    expect(summarize([{ path: 'placement.side', dir: 'asc' }]).sorted).toBe('Sorted: Side (ascending)');
  });

  it('falls back to the raw path for a column that has no title', () => {
    expect(summarize([{ path: 'unknown.thing', dir: 'asc' }]).sorted)
      .toBe('Sorted: unknown.thing (ascending)');
  });

  it('gets the teens right, where a naive suffix table does not', () => {
    const sort = Array.from({ length: 13 }, (_, at) => ({ path: `f${at}`, dir: 'asc' } as SortEntry));
    const sentence = summarize(sort).sorted ?? '';
    expect(sentence).toContain('f10 (11th, ascending)');
    expect(sentence).toContain('f11 (12th, ascending)');
    expect(sentence).toContain('f12 (13th, ascending)');
  });
});

describe('the grouping sentence', () => {
  it('says nothing at all when nothing is grouped', () => {
    expect(summarize([], []).grouped).toBeUndefined();
  });

  it('names the single level plainly', () => {
    expect(summarize([], ['kind']).grouped).toBe('Grouped by: Kind');
  });

  /* "then", not a comma: the levels NEST, and a flat list reads as peers. */
  it('reads layered grouping as a nesting rather than a list', () => {
    expect(summarize([], ['kind', 'status']).grouped).toBe('Grouped by: Kind, then Status');
    expect(summarize([], ['world', 'kind', 'status']).grouped)
      .toBe('Grouped by: World, then Kind, then Status');
  });

  it('reports both halves independently — one can be set without the other', () => {
    const both = summarize([{ path: 'kind', dir: 'asc' }], ['world']);
    expect(both.sorted).toBe('Sorted: Kind (ascending)');
    expect(both.grouped).toBe('Grouped by: World');
  });
});

describe('summaryLine — the one line the footer shows', () => {
  it('shows a placeholder when neither sort nor grouping is active', () => {
    expect(summaryLine(summarize([]))).toBe('No sorting or grouping');
  });

  it('carries the sort sentence alone when nothing is grouped', () => {
    expect(summaryLine(summarize([{ path: 'kind', dir: 'asc' }])))
      .toBe('Sorted: Kind (ascending)');
  });

  it('carries the grouping sentence alone when nothing is sorted', () => {
    expect(summaryLine(summarize([], ['world']))).toBe('Grouped by: World');
  });

  it('joins both halves onto the one line when both are set', () => {
    const line = summaryLine(summarize([{ path: 'kind', dir: 'asc' }], ['world']));
    expect(line).toContain('Sorted: Kind (ascending)');
    expect(line).toContain('Grouped by: World');
    // Order matters: the sort half reads first, same as the old per-column menu.
    expect(line.indexOf('Sorted:')).toBeLessThan(line.indexOf('Grouped by:'));
  });
});
