/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import {
  MAX_COLUMN_WIDTH, MIN_COLUMN_WIDTH,
  clampWidth, fitAllWidths, fitColumnWidth, widthFromDrag,
} from '../../apps/web/src/ui/design-system/composites/DataTable/behavior/column-width-math';
import {
  isOverflowing, naturalWidth, sameFallback,
} from '../../apps/web/src/ui/design-system/composites/DataTable/behavior/overflow-probe';
import {
  AUTO_TRACK, GROW_TRACK, TRACK_FLOOR, TRAILING_MIN_TRACK, TRAILING_TRACK,
  growFitTrack, trackFor, trackList, trackListWith,
} from '../../apps/web/src/ui/design-system/composites/DataTable/DataTable.constants';
import { fitColumn, growColumn, resizeColumn } from '../../apps/web/src/ui/design-system/data/table/column-ops';
import type {
  GrowFallback, OverflowProbe,
} from '../../apps/web/src/ui/design-system/composites/DataTable/behavior/overflow-probe';
import type { TableColumn } from '../../apps/web/src/ui/design-system/data/table/types';

// Sizing as pure functions: seam delta to width, fit-to-content, and the grid
// track per width mode. The gesture and the measuring need a browser.

describe('dragging the seam turns a delta into a width', () => {
  const drag = (startWidth: number, delta: number): number =>
    widthFromDrag({ startWidth, startX: 100, clientX: 100 + delta });

  it('adds the distance the pointer travelled to the width it started at', () => {
    expect(drag(200, 60)).toBe(260);
    expect(drag(200, -60)).toBe(140);
  });

  it('does not move the width when the pointer has not moved', () => {
    expect(drag(240, 0)).toBe(240);
  });

  it('stops at a readable minimum however far left the pointer is pulled', () => {
    expect(drag(200, -500)).toBe(MIN_COLUMN_WIDTH);
  });

  it('stops at a maximum, so one column cannot swallow the row', () => {
    expect(drag(600, 5000)).toBe(MAX_COLUMN_WIDTH);
  });

  it('lands on whole pixels, because a fractional grid track is a blurry edge', () => {
    expect(widthFromDrag({ startWidth: 200.4, startX: 0, clientX: 10.2 })).toBe(211);
  });

  it('is absolute, not incremental: the same pointer position gives the same width', () => {
    expect(drag(200, 30)).toBe(drag(200, 30));
  });
});

describe('fit to content takes the widest thing measured, plus room to breathe', () => {
  it('fits the widest value it was given', () => {
    expect(fitColumnWidth([120, 300, 90])).toBe(316);
  });

  it('never fits below the minimum, however short the values are', () => {
    expect(fitColumnWidth([4, 9])).toBe(MIN_COLUMN_WIDTH);
  });

  it('caps a runaway value instead of sizing a column off the screen', () => {
    expect(fitColumnWidth([9000])).toBe(MAX_COLUMN_WIDTH);
  });

  it('keeps the minimum when nothing could be measured, instead of collapsing', () => {
    expect(fitColumnWidth([])).toBe(MIN_COLUMN_WIDTH);
  });

  it('shares one clamp with the drag, so neither route can produce a width the other cannot', () => {
    expect(clampWidth(0)).toBe(MIN_COLUMN_WIDTH);
    expect(clampWidth(MAX_COLUMN_WIDTH + 1)).toBe(MAX_COLUMN_WIDTH);
  });
});

describe('width modes and what each one emits as a grid track', () => {
  it('leaves an untouched column on the automatic track', () => {
    expect(trackFor({ path: 'id' })).toBe(AUTO_TRACK);
  });

  it('emits a fixed pixel track for a measured or dragged width', () => {
    expect(trackFor({ path: 'id', width: 240 })).toBe('240px');
  });

  it('emits a flexible track for a column that asked for the leftover space', () => {
    expect(trackFor({ path: 'id', grow: true })).toBe(GROW_TRACK);
  });

  it('gives the trailing + cell the slack while no column wants it', () => {
    const columns: readonly TableColumn[] = [{ path: 'id' }, { path: 'kind', width: 120 }];
    expect(trackList(columns)).toBe(`${AUTO_TRACK} 120px ${TRAILING_TRACK}`);
  });

  it('takes that slack off the trailing cell as soon as a column asks for it', () => {
    const columns: readonly TableColumn[] = [{ path: 'id' }, { path: 'kind', grow: true }];
    expect(trackList(columns)).toBe(`${AUTO_TRACK} ${GROW_TRACK} ${TRAILING_MIN_TRACK}`);
  });

  it('leaves a fit column on the automatic track before anything has measured it', () => {
    expect(trackFor({ path: 'id', fit: true })).toBe(AUTO_TRACK);
  });

  it('does not give a fit column the trailing cell\'s slack, because it is not a grow column', () => {
    const columns: readonly TableColumn[] = [{ path: 'id' }, { path: 'kind', fit: true }];
    expect(trackList(columns)).toBe(`${AUTO_TRACK} ${AUTO_TRACK} ${TRAILING_TRACK}`);
  });
});

// "Fit to content" is a persistent MODE, unlike grow: it does not wait for an
// overflow condition to decide whether to act, so its fallback is consulted
// unconditionally the moment a measurement has landed.

describe('a fit column stays at its own measured width', () => {
  const columns: readonly TableColumn[] = [{ path: 'id' }, { path: 'kind', fit: true }];
  const measured: GrowFallback = new Map([['kind', 220]]);

  it('renders at the measured width the moment one is available', () => {
    expect(trackFor(columns[1], undefined, measured)).toBe(growFitTrack(220));
    expect(trackList(columns, undefined, measured)).toBe(`${AUTO_TRACK} ${growFitTrack(220)} ${TRAILING_TRACK}`);
  });

  it('leaves every other column exactly where it was', () => {
    expect(trackFor(columns[0], undefined, measured)).toBe(AUTO_TRACK);
  });

  it('is a render override only, so the column list still says the column is in fit mode', () => {
    expect(trackList(columns, undefined, measured)).not.toBe(trackList(columns));
    expect(columns[1]).toEqual({ path: 'kind', fit: true });
    expect(columns[1].width).toBeUndefined();
  });

  it('shows through a resize preview too, for whichever OTHER column is being dragged', () => {
    expect(trackListWith(columns, 'id', 200, undefined, measured))
      .toBe(`200px ${growFitTrack(220)} ${TRAILING_TRACK}`);
  });

  it('converts to a fixed width the moment its OWN seam is dragged', () => {
    expect(trackListWith(columns, 'kind', 300, undefined, measured)).toBe(`${AUTO_TRACK} 300px ${TRAILING_TRACK}`);
  });
});

// A grow column only fills while there is space left over. Once the table
// scrolls sideways it sizes to content, and fills again when space returns.

describe('is there any space left over', () => {
  const probe = (over: Partial<OverflowProbe> = {}): OverflowProbe => ({
    scrollWidth: 800, clientWidth: 1000, flexibleRendered: 0, flexibleFitted: 0, ...over,
  });

  it('says no overflow while the columns fit inside what is visible', () => {
    expect(isOverflowing(probe())).toBe(false);
  });

  it('says overflow once they need more room than is visible', () => {
    expect(isOverflowing(probe({ scrollWidth: 1400 }))).toBe(true);
  });

  it('treats an exact fit as room enough, not as an overflow', () => {
    expect(isOverflowing(probe({ scrollWidth: 1000 }))).toBe(false);
  });

  it('forgives a sub-pixel spill, which is layout rounding, not overflow', () => {
    expect(isOverflowing(probe({ scrollWidth: 1000.5 }))).toBe(false);
    expect(isOverflowing(probe({ scrollWidth: 1004 }))).toBe(true);
  });

  // A table already showing a filled column measures wide BECAUSE it is filled.
  // Flexible columns go back to content width first so both modes agree.
  it('asks what the table needs, not what a filled column stretched it to', () => {
    const filled = probe({ scrollWidth: 1000, flexibleRendered: 500, flexibleFitted: 200 });
    expect(naturalWidth(filled)).toBe(700);
    expect(isOverflowing(filled)).toBe(false);
  });

  it('gives the same answer from either mode, so neither can flip the other back', () => {
    const filling = probe({ scrollWidth: 1000, flexibleRendered: 460, flexibleFitted: 300 });
    const fallen = probe({ scrollWidth: 840, flexibleRendered: 300, flexibleFitted: 300 });
    expect(naturalWidth(filling)).toBe(naturalWidth(fallen));
    expect(isOverflowing(filling)).toBe(isOverflowing(fallen));
  });

  it('still reports the overflow a filled column is hiding', () => {
    const filling = probe({ clientWidth: 600, scrollWidth: 900, flexibleRendered: 200, flexibleFitted: 400 });
    expect(isOverflowing(filling)).toBe(true);
  });

  it('counts every flexible column, not just the first', () => {
    expect(naturalWidth(probe({ flexibleRendered: 260 + 140, flexibleFitted: 90 + 70 }))).toBe(560);
  });
});

describe('a grow column while there is nothing left over', () => {
  const columns: readonly TableColumn[] = [{ path: 'id' }, { path: 'kind', grow: true }];
  const fallen: GrowFallback = new Map([['kind', 180]]);

  it('fills the row while nothing says otherwise', () => {
    expect(trackList(columns, null)).toBe(`${AUTO_TRACK} ${GROW_TRACK} ${TRAILING_MIN_TRACK}`);
  });

  it('sizes itself to its content once there is no room to fill', () => {
    expect(trackFor(columns[1], fallen)).toBe(growFitTrack(180));
    expect(trackList(columns, fallen)).toBe(`${AUTO_TRACK} ${growFitTrack(180)} ${TRAILING_MIN_TRACK}`);
  });

  // The floor sits in front of the measured width. A narrower fallback could
  // un-overflow the table, restore the fill, and overflow it again.
  it('never falls back to less than the grow track would have taken', () => {
    expect(growFitTrack(70)).toBe(`minmax(${TRACK_FLOOR}, 70px)`);
    expect(GROW_TRACK).toBe(`minmax(${TRACK_FLOOR}, 1fr)`);
  });

  it('leaves every other column exactly where it was', () => {
    expect(trackFor(columns[0], fallen)).toBe(AUTO_TRACK);
    expect(trackFor({ path: 'note', width: 240 }, fallen)).toBe('240px');
  });

  it('goes straight back to filling when the fallback lifts, with no re-click', () => {
    expect(trackList(columns, null)).toBe(trackList(columns));
    expect(trackList(columns, new Map())).toBe(trackList(columns));
  });

  it('keeps the trailing cell out of the slack while the column is still a grow column', () => {
    expect(trackList(columns, fallen).endsWith(TRAILING_MIN_TRACK)).toBe(true);
  });

  it('shows the fallback through a resize preview too, so nothing jumps mid-drag', () => {
    expect(trackListWith(columns, 'id', 200, fallen))
      .toBe(`200px ${growFitTrack(180)} ${TRAILING_MIN_TRACK}`);
  });

  // The fallback rides alongside the list, so ONE list renders both ways.
  it('is a render override only: the column list still says the column grows', () => {
    const rendered = [trackList(columns, fallen), trackList(columns, null)];
    expect(rendered[0]).not.toBe(rendered[1]);
    expect(columns[1]).toEqual({ path: 'kind', grow: true });
    expect(columns[1].width).toBeUndefined();
  });

  it('reports two fallbacks that would render alike as the same, so a re-measure is a no-op', () => {
    expect(sameFallback(new Map([['kind', 180]]), new Map([['kind', 180]]))).toBe(true);
    expect(sameFallback(new Map([['kind', 180]]), new Map([['kind', 181]]))).toBe(false);
    expect(sameFallback(null, null)).toBe(true);
    expect(sameFallback(null, new Map())).toBe(false);
  });
});

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

// A seam drag never goes through state while it runs. It writes this list, and
// only the width it ended on is committed. So the preview and the commit have
// to agree, which is what these check.

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
