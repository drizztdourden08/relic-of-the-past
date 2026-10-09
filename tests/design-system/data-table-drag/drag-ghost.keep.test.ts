/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ghostRowSample, groupUid, ColumnDragGhost } from '@drizztdourden08/tessera/composites';
import type { GroupedRow } from '@drizztdourden08/tessera/data';
import { ALWAYS } from './data-table-drag.constants';

interface Sample { id: string }

const leaf = (id: string): GroupedRow<Sample> => ({ kind: 'row', row: { id } });

const branch = (key: string, children: readonly GroupedRow<Sample>[]): GroupedRow<Sample> =>
  ({ kind: 'group', level: 0, key, path: 'kind', count: children.length, children });

const idsOf = (rows: readonly Sample[]): string[] => rows.map((row) => row.id);

describe('what the drag ghost samples out of the column', () => {
  const flat: readonly GroupedRow<Sample>[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(leaf);

  it('takes the rows off the top, in the order they render', () => {
    expect(idsOf(ghostRowSample({ nodes: flat, isExpanded: ALWAYS, limit: 3 })))
      .toEqual(['a', 'b', 'c']);
  });

  it('caps at the limit however long the table is', () => {
    const long = Array.from({ length: 896 }, (_, index) => leaf(String(index)));
    expect(ghostRowSample({ nodes: long, isExpanded: ALWAYS, limit: 6 })).toHaveLength(6);
  });

  it('takes what there is when the table is shorter than the cap', () => {
    expect(idsOf(ghostRowSample({ nodes: flat.slice(0, 2), isExpanded: ALWAYS, limit: 6 })))
      .toEqual(['a', 'b']);
  });

  it('samples nothing at all instead of one row when the cap is zero', () => {
    expect(ghostRowSample({ nodes: flat, isExpanded: ALWAYS, limit: 0 })).toEqual([]);
  });

  it('walks into groups, so a grouped table samples records and not headings', () => {
    const grouped = [branch('one', [leaf('a'), leaf('b')]), branch('two', [leaf('c')])];
    expect(idsOf(ghostRowSample({ nodes: grouped, isExpanded: ALWAYS, limit: 6 })))
      .toEqual(['a', 'b', 'c']);
  });

  it('skips a collapsed branch because a row nobody can see is not a sample of the screen', () => {
    const grouped = [branch('one', [leaf('a'), leaf('b')]), branch('two', [leaf('c')])];
    const openOnly = (uid: string): boolean => uid === groupUid('', 'kind', 'two');
    expect(idsOf(ghostRowSample({ nodes: grouped, isExpanded: openOnly, limit: 6 })))
      .toEqual(['c']);
  });
});

describe('the drag ghost shows the column, not just its name', () => {
  const rows = [{ label: 'first' }, { label: 'second' }];

  const renderGhost = (extra: Record<string, unknown> = {}): string =>
    renderToStaticMarkup(createElement(ColumnDragGhost, {
      label: 'Label', path: 'label', rows, total: rows.length, ...extra,
    }));

  it('carries the header name and a cell for every row it sampled', () => {
    const markup = renderGhost();
    expect(markup).toContain('Label');
    expect(markup).toContain('first');
    expect(markup).toContain('second');
    expect(markup.match(/data-table__drag-ghost-cell/g)).toHaveLength(2);
  });

  it('owns up to the rows it left behind, and stays quiet when there are none', () => {
    expect(renderGhost({ total: 896 })).toContain('+894 more');
    expect(renderGhost()).not.toContain('data-table__drag-ghost-rest');
  });

  it('is decorative, so nothing in it is announced or reachable', () => {
    expect(renderGhost()).toContain('aria-hidden="true"');
  });
});
