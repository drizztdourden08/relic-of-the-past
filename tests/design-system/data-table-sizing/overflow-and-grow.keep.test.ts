/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import {
  isOverflowing, naturalWidth, sameFallback,
} from '../../../apps/web/src/ui/design-system/composites/DataTable/behavior/overflow-probe';
import {
  AUTO_TRACK, GROW_TRACK, TRACK_FLOOR, TRAILING_MIN_TRACK,
  growFitTrack, trackFor, trackList, trackListWith,
} from '../../../apps/web/src/ui/design-system/composites/DataTable/DataTable.constants';
import type {
  GrowFallback, OverflowProbe,
} from '../../../apps/web/src/ui/design-system/composites/DataTable/behavior/overflow-probe';
import type { TableColumn } from '../../../apps/web/src/ui/design-system/data/table/types';

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
