/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import {
  MAX_COLUMN_WIDTH, MIN_COLUMN_WIDTH,
  clampWidth, fitColumnWidth, widthFromDrag,
} from '../../../apps/web/src/ui/design-system/composites/DataTable/behavior/column-width-math';
import {
  AUTO_TRACK, GROW_TRACK, TRAILING_MIN_TRACK, TRAILING_TRACK,
  growFitTrack, trackFor, trackList, trackListWith,
} from '../../../apps/web/src/ui/design-system/composites/DataTable/DataTable.constants';
import type {
  GrowFallback,
} from '../../../apps/web/src/ui/design-system/composites/DataTable/behavior/overflow-probe';
import type { TableColumn } from '../../../apps/web/src/ui/design-system/data/table/types';

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
