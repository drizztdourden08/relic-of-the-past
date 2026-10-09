/* @layer tests @kind test */
// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { act } from 'react';
import { HOT, RATE, rateFor, scrollerFor } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/behavior/use-drag-autoscroll';
import { VIEW } from './drag-timers.constants';
import { installOutlineRig } from './install-outline-rig';

const rig = installOutlineRig();
const { runFrames, layOut, pointer, rowFor, mountOutline, dragTo } = rig;

describe('the ramp is the design decision, so it is pinned as arithmetic', () => {
  it('is 0 at the band\'s inner lip and the full rate at the very edge', () => {
    expect(rateFor(VIEW, VIEW.bottom - HOT, RATE)).toBe(0);
    expect(rateFor(VIEW, VIEW.bottom, RATE)).toBe(RATE);
    expect(rateFor(VIEW, VIEW.top, RATE)).toBe(-RATE);
    expect(rateFor(VIEW, VIEW.top + HOT, RATE)).toBe(0);
  });

  it('ramps LINEARLY across the band, because a constant rate makes it a cliff', () => {
    expect(rateFor(VIEW, VIEW.bottom - HOT / 2, RATE)).toBeCloseTo(RATE / 2);
    expect(rateFor(VIEW, VIEW.top + HOT / 2, RATE)).toBeCloseTo(-RATE / 2);
  });

  it('is 0 everywhere between the two bands, and outside the scroller entirely', () => {
    expect(rateFor(VIEW, 100, RATE)).toBe(0);
    expect(rateFor(VIEW, VIEW.bottom + 40, RATE)).toBe(0);
  });
});

describe('which element is panned is resolved, never assumed', () => {
  it('walks up to the nearest ancestor that can actually scroll', () => {
    mountOutline();
    const rows = layOut();
    expect(scrollerFor(rowFor('a'))).toBe(rows);
  });

  it('finds nothing when there is nothing to scroll, and pans nothing', () => {
    mountOutline();
    layOut(false);
    expect(scrollerFor(rowFor('a'))).toBeNull();
    dragTo(196);
    runFrames(3);
    expect(rig.scrolled()).toBe(0);
  });
});

describe('the pan itself', () => {
  it('scrolls by the ramped rate, once per frame, while the pointer sits in the band', () => {
    mountOutline();
    layOut();
    dragTo(VIEW.bottom - 4);
    const perFrame = rateFor(VIEW, VIEW.bottom - 4, RATE);
    runFrames(1);
    expect(rig.scrolled()).toBeCloseTo(perFrame);
    runFrames(2);
    expect(rig.scrolled()).toBeCloseTo(perFrame * 3);
  });

  it('keeps running under a STATIONARY cursor, which is the whole point', () => {
    mountOutline();
    layOut();
    dragTo(VIEW.bottom);
    runFrames(5);
    expect(rig.scrolled()).toBeCloseTo(RATE * 5);
  });

  it('stops of its own accord the moment the pointer leaves the band', () => {
    mountOutline();
    layOut();
    dragTo(VIEW.bottom);
    runFrames(1);
    const reached = rig.scrolled();
    act(() => { window.dispatchEvent(pointer('pointermove', 100)); });
    runFrames(3);
    expect(rig.scrolled()).toBe(reached);
    expect(rig.pendingFrames()).toBe(0);
  });
});

describe('EVERY LOOP IS CANCELLED, since a leaked loop is the defect this phase would most plausibly ship', () => {
  const leaks = (finish: () => void): { queued: number; after: number } => {
    mountOutline();
    layOut();
    dragTo(VIEW.bottom);
    runFrames(1);
    const reached = rig.scrolled();
    act(() => { finish(); });
    const queued = rig.pendingFrames();
    runFrames(4);
    return { queued, after: rig.scrolled() - reached };
  };

  it('on the DROP', () => {
    const { queued, after } = leaks(() => window.dispatchEvent(pointer('pointerup', VIEW.bottom)));
    expect(queued).toBe(0);
    expect(after).toBe(0);
  });

  it('on ESCAPE', () => {
    const { queued, after } = leaks(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(queued).toBe(0);
    expect(after).toBe(0);
  });

  it('on POINTERCANCEL', () => {
    const { queued, after } = leaks(() => window.dispatchEvent(pointer('pointercancel', VIEW.bottom)));
    expect(queued).toBe(0);
    expect(after).toBe(0);
  });

  it('and on unmount, which is the case no gesture reports', () => {
    mountOutline();
    layOut();
    dragTo(VIEW.bottom);
    rig.unmount();
    expect(rig.pendingFrames()).toBe(0);
  });
});
