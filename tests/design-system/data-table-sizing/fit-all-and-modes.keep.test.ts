/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import {
  MIN_COLUMN_WIDTH, fitAllWidths, fitColumnWidth,
} from '../../../apps/web/src/ui/design-system/composites/DataTable/behavior/column-width-math';
import {
  AUTO_TRACK, TRAILING_TRACK, trackList, trackListWith,
} from '../../../apps/web/src/ui/design-system/composites/DataTable/DataTable.constants';
import { fitColumn, growColumn, resizeColumn } from '../../../apps/web/src/ui/design-system/data/table/column-ops';
import type { TableColumn } from '../../../apps/web/src/ui/design-system/data/table/types';

describe('fit all to content runs the same fit once per column', () => {
  const widths: Record<string, number[]> = { id: [90, 120], kind: [300], note: [8] };
  const measured = (path: string): readonly number[] => widths[path] ?? [];

  it('fits every path it was given, in the order it was given them', () => {
    expect(fitAllWidths(['id', 'kind', 'note'], measured)).toEqual([
      { path: 'id', width: 136 },
      { path: 'kind', width: 316 },
      { path: 'note', width: MIN_COLUMN_WIDTH },
    ]);
  });

  it('measures each column exactly once', () => {
    const seen: string[] = [];
    fitAllWidths(['id', 'kind', 'id'], (path) => {
      seen.push(path);
      return measured(path);
    });
    expect(seen).toEqual(['id', 'kind', 'id']);
  });

  it('agrees to the pixel with fitting that column on its own', () => {
    const [only] = fitAllWidths(['kind'], measured);
    expect(only.width).toBe(fitColumnWidth(widths.kind));
  });

  it('does nothing at all when there are no columns', () => {
    expect(fitAllWidths([], measured)).toEqual([]);
  });
});

describe('the live preview of a seam drag', () => {
  const columns: readonly TableColumn[] = [{ path: 'id' }, { path: 'kind' }];

  it('reads exactly as the committed list would, for the same width', () => {
    expect(trackListWith(columns, 'kind', 240)).toBe(trackList(resizeColumn(columns, 'kind', 240)));
  });

  it('leaves the track of every other column alone', () => {
    expect(trackListWith(columns, 'kind', 240)).toBe(`${AUTO_TRACK} 240px ${TRAILING_TRACK}`);
  });

  it('drops the column out of grow, because a dragged width IS a fixed width', () => {
    const grown = growColumn(columns, 'kind');
    expect(trackListWith(grown, 'kind', 240)).toBe(`${AUTO_TRACK} 240px ${TRAILING_TRACK}`);
    expect(trackListWith(grown, 'kind', 240)).toBe(trackList(resizeColumn(grown, 'kind', 240)));
  });

  it('changes nothing when the column being dragged is not in the list', () => {
    expect(trackListWith(columns, 'absent', 240)).toBe(trackList(columns));
  });
});

describe('a width, a grow flag and a fit flag are one setting, so only one can be on', () => {
  const columns: readonly TableColumn[] = [{ path: 'id' }, { path: 'kind' }];

  it('drops the grow flag when the column is given a pixel width', () => {
    const grown = growColumn(columns, 'kind');
    expect(grown[1]).toEqual({ path: 'kind', grow: true });
    expect(resizeColumn(grown, 'kind', 200)[1]).toEqual({ path: 'kind', width: 200 });
  });

  it('drops the pixel width when the column is told to take the leftover', () => {
    const sized = resizeColumn(columns, 'kind', 200);
    expect(growColumn(sized, 'kind')[1]).toEqual({ path: 'kind', grow: true });
  });

  it('drops a width or a grow flag when the column is turned to fit mode', () => {
    expect(fitColumn(resizeColumn(columns, 'kind', 200), 'kind')[1]).toEqual({ path: 'kind', fit: true });
    expect(fitColumn(growColumn(columns, 'kind'), 'kind')[1]).toEqual({ path: 'kind', fit: true });
  });

  it('drops fit mode the moment a width or a grow flag is set instead', () => {
    const fitted = fitColumn(columns, 'kind');
    expect(resizeColumn(fitted, 'kind', 200)[1]).toEqual({ path: 'kind', width: 200 });
    expect(growColumn(fitted, 'kind')[1]).toEqual({ path: 'kind', grow: true });
  });

  it('touches nothing but the column named', () => {
    expect(growColumn(columns, 'kind')[0]).toEqual({ path: 'id' });
    expect(resizeColumn(columns, 'absent', 200)).toEqual(columns);
  });

  it('keeps a visual rename through any of the three', () => {
    const renamed: readonly TableColumn[] = [{ path: 'kind', label: 'Sort of' }];
    expect(growColumn(renamed, 'kind')[0].label).toBe('Sort of');
    expect(resizeColumn(renamed, 'kind', 200)[0].label).toBe('Sort of');
    expect(fitColumn(renamed, 'kind')[0].label).toBe('Sort of');
  });
});
