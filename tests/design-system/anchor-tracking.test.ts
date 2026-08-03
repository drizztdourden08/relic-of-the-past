/* @layer tests @kind test */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clippingAncestorsOf, intersect, overlaps, viewportBounds, visibleBoundsOf,
} from '../../apps/web/src/ui/design-system/primitives/Portal/behavior/anchor-position';
import {
  observeAnchorMovement,
} from '../../apps/web/src/ui/design-system/primitives/Portal/behavior/observe-anchor-movement';
import {
  dropPanelPositionFor,
} from '../../apps/web/src/ui/design-system/primitives/Portal/behavior/drop-panel-position';
import type { Bounds } from '../../apps/web/src/ui/design-system/primitives/Portal/behavior/anchor-position';
import type {
  EventTargetLike,
} from '../../apps/web/src/ui/design-system/primitives/Portal/behavior/observe-anchor-movement';

// A portalled panel is placed in viewport coordinates, so it drifts away from
// its trigger the moment anything scrolls. The fix has two halves, and both of
// them are here: the geometry that decides where the panel goes and whether
// the trigger can still be seen, and the listener wiring that re-runs it. The
// React glue between the two (use-anchor-tracking) cannot be exercised without
// a DOM — this suite has no jsdom — so it is deliberately kept thin, with the
// decisions living in the plain functions covered below.

const rect = (top: number, left: number, height: number, width: number): DOMRect => ({
  top,
  left,
  bottom: top + height,
  right: left + width,
  height,
  width,
  x: left,
  y: top,
  toJSON: () => ({}),
});

const bounds = (top: number, right: number, bottom: number, left: number): Bounds =>
  ({ top, right, bottom, left });

const elementAt = (value: Bounds): Element =>
  ({ getBoundingClientRect: () => value }) as unknown as Element;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('anchor visibility — when a panel has nothing left to point at', () => {
  const viewport = bounds(0, 1000, 800, 0);

  it('keeps the panel while any sliver of the anchor is inside the bounds', () => {
    expect(overlaps(rect(400, 100, 30, 200), viewport)).toBe(true);
    expect(overlaps(rect(-10, 100, 30, 200), viewport)).toBe(true);
    expect(overlaps(rect(790, 100, 30, 200), viewport)).toBe(true);
  });

  it('gives up once the anchor has scrolled clear of every edge', () => {
    expect(overlaps(rect(-40, 100, 30, 200), viewport)).toBe(false);
    expect(overlaps(rect(810, 100, 30, 200), viewport)).toBe(false);
    expect(overlaps(rect(400, -300, 30, 200), viewport)).toBe(false);
    expect(overlaps(rect(400, 1010, 30, 200), viewport)).toBe(false);
  });

  it('treats an anchor exactly flush with an edge as gone', () => {
    expect(overlaps(rect(-30, 100, 30, 200), viewport)).toBe(false);
    expect(overlaps(rect(800, 100, 30, 200), viewport)).toBe(false);
  });
});

describe('visible bounds — the viewport narrowed by every clipping ancestor', () => {
  it('is the whole viewport when nothing clips', () => {
    vi.stubGlobal('window', { innerWidth: 1000, innerHeight: 800 });
    expect(visibleBoundsOf([])).toEqual(viewportBounds());
  });

  it('shrinks to the intersection of the scroll containers in between', () => {
    vi.stubGlobal('window', { innerWidth: 1000, innerHeight: 800 });
    const pane = elementAt(bounds(100, 600, 500, 50));
    const inner = elementAt(bounds(150, 900, 400, 0));
    expect(visibleBoundsOf([pane, inner])).toEqual(bounds(150, 600, 400, 50));
  });

  it('closes a panel whose trigger is inside the viewport but clipped by its scroller', () => {
    vi.stubGlobal('window', { innerWidth: 1000, innerHeight: 800 });
    const scroller = elementAt(bounds(100, 600, 500, 50));
    // A row scrolled below the pane's own edge: still on screen, but hidden.
    const trigger = rect(540, 100, 30, 200);
    expect(overlaps(trigger, viewportBounds())).toBe(true);
    expect(overlaps(trigger, visibleBoundsOf([scroller]))).toBe(false);
  });

  it('intersects two rectangles by taking the innermost edge of each', () => {
    expect(intersect(bounds(0, 100, 100, 0), bounds(20, 200, 60, 10)))
      .toEqual(bounds(20, 100, 60, 10));
  });
});

describe('clipping ancestors — resolved once, so scroll ticks stay cheap', () => {
  it('collects only the ancestors whose overflow can hide a descendant', () => {
    const body = { parentElement: null } as unknown as HTMLElement;
    const scroller = { parentElement: body, __overflow: 'auto' } as unknown as HTMLElement;
    const plain = { parentElement: scroller, __overflow: 'visible' } as unknown as HTMLElement;
    const anchor = { parentElement: plain } as unknown as HTMLElement;

    vi.stubGlobal('document', { body });
    vi.stubGlobal('getComputedStyle', (el: { __overflow?: string }) => ({
      overflowY: el.__overflow ?? 'visible',
      overflowX: el.__overflow ?? 'visible',
    }));

    expect(clippingAncestorsOf(anchor)).toEqual([scroller]);
  });

  it('stops at the body rather than walking into the document element', () => {
    const body = { parentElement: null } as unknown as HTMLElement;
    const anchor = { parentElement: body } as unknown as HTMLElement;

    vi.stubGlobal('document', { body });
    vi.stubGlobal('getComputedStyle', () => ({ overflowY: 'hidden', overflowX: 'hidden' }));

    expect(clippingAncestorsOf(anchor)).toEqual([]);
  });
});

describe('movement listeners — capture, and symmetric teardown', () => {
  const fakeTarget = () => {
    const added: unknown[][] = [];
    const removed: unknown[][] = [];
    const target = {
      addEventListener: (...args: unknown[]) => { added.push(args); },
      removeEventListener: (...args: unknown[]) => { removed.push(args); },
    } as unknown as EventTargetLike;
    return { target, added, removed };
  };

  it('listens for scroll in the capture phase so inner containers are heard', () => {
    const { target, added } = fakeTarget();
    const onScroll = vi.fn();
    const onResize = vi.fn();

    observeAnchorMovement(target, { onScroll, onResize });

    expect(added).toEqual([
      ['scroll', onScroll, true],
      ['resize', onResize],
    ]);
  });

  it('removes exactly what it added, capture flag included', () => {
    const { target, added, removed } = fakeTarget();
    const onScroll = vi.fn();
    const onResize = vi.fn();

    observeAnchorMovement(target, { onScroll, onResize })();

    expect(removed).toEqual(added);
  });
});

describe('drop panel placement — exercised with the Select trigger\'s own numbers', () => {
  // Mirrors the options useSelectDropdown passes: 200 / 4 / 180.
  const selectPositionFor = (r: DOMRect) =>
    dropPanelPositionFor(r, { roomForDropDown: 200, gap: 4, minPanelWidth: 180 });

  it('hangs below the trigger when there is room, with a gap', () => {
    vi.stubGlobal('window', { innerHeight: 800, innerWidth: 1000 });
    const pos = selectPositionFor(rect(100, 40, 30, 220));
    expect(pos).toEqual({ top: 134, left: 40, width: 220, dropUp: false });
  });

  it('flips above once the space below is too tight and above is roomier', () => {
    vi.stubGlobal('window', { innerHeight: 800, innerWidth: 1000 });
    const pos = selectPositionFor(rect(700, 40, 30, 220));
    expect(pos.dropUp).toBe(true);
    expect(pos.top).toBe(696);
  });

  it('stays below when room is tight on both sides but tighter above', () => {
    vi.stubGlobal('window', { innerHeight: 250, innerWidth: 1000 });
    expect(selectPositionFor(rect(50, 40, 30, 220)).dropUp).toBe(false);
  });

  it('widens a narrow trigger to a readable minimum', () => {
    vi.stubGlobal('window', { innerHeight: 800, innerWidth: 1000 });
    expect(selectPositionFor(rect(100, 40, 30, 60)).width).toBe(180);
  });

  it('re-measures purely from the rect, so a scrolled trigger moves the panel with it', () => {
    vi.stubGlobal('window', { innerHeight: 800, innerWidth: 1000 });
    const before = selectPositionFor(rect(100, 40, 30, 220));
    const after = selectPositionFor(rect(40, 40, 30, 220));
    expect(after.top).toBe(before.top - 60);
  });
});
