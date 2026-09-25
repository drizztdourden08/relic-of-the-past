// @vitest-environment jsdom
/* @layer tests @kind test */
/**
 * Phase 5 of `plans/hud-drag-and-drop.html` covers AUTO-SCROLL AND SPRING-LOAD,
 * which are both loops, which is why they share a file.
 *
 * THE CLAIM WORTH TESTING IS NOT THAT THEY RUN. It is that they STOP. A rAF that
 * survives a drop keeps panning a list nobody is dragging over, and a dwell
 * timer that survives one opens a row half a second after the gesture ended.
 * Both are the kind of defect that ships green because every assertion was about
 * the happy path. So each exit gets its own case: the drop, `Escape`, and
 * `pointercancel`. The rAF queue is stubbed instead of faked precisely so that
 * "nothing is pending" is a number this file can read.
 *
 * WHAT THIS DOES NOT PROVE, said plainly. §44.7 recorded that the outline is
 * driven end to end in jsdom over a stubbed `document.elementFromPoint` and a
 * flat list of fixed-height rows. THAT STUB DOES NOT MODEL SCROLLING: it answers
 * from the y coordinate alone, so the rows it returns do not move when
 * `scrollTop` changes. What is therefore proved here is that the right scroller
 * is found, that the ramp produces the right delta, that the frame loop is
 * driven by the pointer and re-emits it, and that every loop is cancelled. What
 * is NOT proved is that new rows arrive under a stationary cursor and the ghost
 * renames them. That needs a real layout engine, and the honest claim is the
 * arithmetic plus the re-emitted frame, not the outcome.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { HOT, RATE, rateFor, scrollerFor } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/use-drag-autoscroll';
import { OutlinePanel } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/OutlinePanel';
import { useHudEditorViewStore } from '../../apps/web/src/stores/hud-editor-view-store';
import { PlatformContext } from '../../apps/web/src/platform/PlatformProvider';
import type { Platform } from '../../shared/platform';
import type { HudLayout, HudNode } from '../../shared/types/hud';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const PLATFORM = { info: { os: 'windows' } } as unknown as Platform;
const leaf = (id: string): HudNode => ({ id, kind: 'element', element: { type: 'spacer' } } as unknown as HudNode);

/** Deep enough that the drag cannot reach the bottom of it, which is
 *  the condition this phase exists for, and with one CONTAINER low down for the
 *  spring to open. */
const DOC = {
  id: 'l',
  name: 'l',
  screen: {
    id: 'screen',
    kind: 'container',
    direction: 'column',
    children: [
      leaf('a'), leaf('b'), leaf('c'), leaf('d'), leaf('e'), leaf('f'),
      { id: 'vault', kind: 'container', direction: 'row', children: [leaf('coin'), leaf('gem')] },
    ],
  },
} as unknown as HudLayout;

// ── the rAF queue, stubbed so "nothing is pending" is readable ──────────────
let pending = new Map<number, FrameRequestCallback>();
let nextFrame = 1;
const realRaf = globalThis.requestAnimationFrame;
const realCaf = globalThis.cancelAnimationFrame;

const runFrames = (times = 1): void => {
  for (let i = 0; i < times; i += 1) {
    const due = [...pending.values()];
    pending = new Map();
    act(() => { due.forEach((cb) => cb(0)); });
  }
};

let mounted: { root: Root; host: HTMLElement } | null = null;

const mount = (node: ReactNode): void => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => { root.render(h(PlatformContext.Provider, { value: PLATFORM }, node)); });
  mounted = { root, host };
};

beforeEach(() => {
  pending = new Map();
  nextFrame = 1;
  globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
    const id = nextFrame; nextFrame += 1; pending.set(id, cb); return id;
  }) as typeof globalThis.requestAnimationFrame;
  globalThis.cancelAnimationFrame = ((id: number) => { pending.delete(id); }) as typeof globalThis.cancelAnimationFrame;
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  useHudEditorViewStore.setState({ collapsedNodeIds: new Set() });
});

afterEach(() => {
  if (mounted) {
    const { root, host } = mounted;
    act(() => root.unmount());
    host.remove();
    mounted = null;
  }
  document.querySelector('#portal-root')?.remove();
  vi.useRealTimers();
  globalThis.requestAnimationFrame = realRaf;
  globalThis.cancelAnimationFrame = realCaf;
});

// ── the outline, laid out ───────────────────────────────────────────────────
const ROW = 22;
/** The scroller's own box. The bottom band is y 176..200. */
const VIEW = { top: 0, bottom: 200, left: 0, right: 200 };

const rowsInOrder = (): HTMLElement[] =>
  Array.from(document.querySelectorAll('[data-outline-row]')) as HTMLElement[];

const rect = (box: typeof VIEW): DOMRect => ({
  x: box.left, y: box.top, width: box.right - box.left, height: box.bottom - box.top,
  top: box.top, left: box.left, right: box.right, bottom: box.bottom, toJSON: () => ({}),
}) as DOMRect;

let scrolled = 0;

/** jsdom lays nothing out and never scrolls anything, so the one element whose
 *  geometry this hook reads is given a real one. */
const layOut = (canScroll = true): HTMLElement => {
  rowsInOrder().forEach((row, index) => {
    row.getBoundingClientRect = () => rect({ top: index * ROW, bottom: (index + 1) * ROW, left: 0, right: 200 });
  });
  document.elementFromPoint = (_x: number, y: number) => rowsInOrder()[Math.floor(y / ROW)] ?? null;
  const rows = document.querySelector('.hud-outline__rows') as HTMLElement;
  scrolled = 0;
  rows.getBoundingClientRect = () => rect(VIEW);
  Object.defineProperty(rows, 'scrollHeight', { get: () => (canScroll ? 1000 : 200), configurable: true });
  Object.defineProperty(rows, 'clientHeight', { get: () => 200, configurable: true });
  Object.defineProperty(rows, 'scrollTop', {
    get: () => scrolled, set: (v: number) => { scrolled = v; }, configurable: true,
  });
  return rows;
};

const pointer = (type: string, y: number): MouseEvent =>
  new MouseEvent(type, { bubbles: true, cancelable: true, clientX: 40, clientY: y });

const rowFor = (id: string): HTMLElement => {
  const found = rowsInOrder().find((row) => row.dataset.outlineRow === id);
  if (!found) throw new Error(`no row for ${id}`);
  return found;
};

const mountOutline = (onDrop: (ids: readonly string[], intent: unknown) => void = () => {}): void => {
  mount(h(OutlinePanel, {
    doc: DOC, selectedId: null, slotNumbers: [], onSelect: () => {}, onRemove: () => {}, onDrop,
  }));
};

/** Press on `a` and walk the pointer to `y`, which is inside the bottom band. */
const dragTo = (y: number): void => {
  act(() => { rowFor('a').dispatchEvent(pointer('pointerdown', 11)); });
  act(() => { window.dispatchEvent(pointer('pointermove', 40)); });
  act(() => { window.dispatchEvent(pointer('pointermove', y)); });
};

describe('the ramp is the design decision, so it is pinned as arithmetic', () => {
  it('is 0 at the band\'s inner lip and the full rate at the very edge', () => {
    expect(rateFor(VIEW, VIEW.bottom - HOT, RATE)).toBe(0);
    expect(rateFor(VIEW, VIEW.bottom, RATE)).toBe(RATE);
    expect(rateFor(VIEW, VIEW.top, RATE)).toBe(-RATE);
    expect(rateFor(VIEW, VIEW.top + HOT, RATE)).toBe(0);
  });

  it('ramps LINEARLY across the band, because a constant rate makes it a cliff', () => {
    // Halfway in is half speed, both ends. Depth is the one control the gesture
    // can offer, and it only exists if this is a slope.
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
    // From a ROW, which cannot scroll, up to the list, which can.
    expect(scrollerFor(rowFor('a'))).toBe(rows);
  });

  it('finds nothing when there is nothing to scroll, and pans nothing', () => {
    mountOutline();
    layOut(false);
    expect(scrollerFor(rowFor('a'))).toBeNull();
    dragTo(196);
    runFrames(3);
    expect(scrolled).toBe(0);
  });
});

describe('the pan itself', () => {
  it('scrolls by the ramped rate, once per frame, while the pointer sits in the band', () => {
    mountOutline();
    layOut();
    // 4 px from the bottom edge: (1 - 20/24) of the full 14 px per frame.
    dragTo(VIEW.bottom - 4);
    const perFrame = rateFor(VIEW, VIEW.bottom - 4, RATE);
    runFrames(1);
    expect(scrolled).toBeCloseTo(perFrame);
    runFrames(2);
    expect(scrolled).toBeCloseTo(perFrame * 3);
  });

  it('keeps running under a STATIONARY cursor, which is the whole point', () => {
    mountOutline();
    layOut();
    dragTo(VIEW.bottom);
    // No further pointer event of the caller's own: the loop re-schedules
    // itself, and each frame re-emits the pointer so the hit test runs again.
    runFrames(5);
    expect(scrolled).toBeCloseTo(RATE * 5);
  });

  it('stops of its own accord the moment the pointer leaves the band', () => {
    mountOutline();
    layOut();
    dragTo(VIEW.bottom);
    runFrames(1);
    const reached = scrolled;
    act(() => { window.dispatchEvent(pointer('pointermove', 100)); });
    runFrames(3);
    expect(scrolled).toBe(reached);
    expect(pending.size).toBe(0);
  });
});

describe('EVERY LOOP IS CANCELLED, since a leaked loop is the defect this phase would most plausibly ship', () => {
  const leaks = (finish: () => void): { queued: number; after: number } => {
    mountOutline();
    layOut();
    dragTo(VIEW.bottom);
    runFrames(1);
    const reached = scrolled;
    act(() => { finish(); });
    const queued = pending.size;
    runFrames(4);
    return { queued, after: scrolled - reached };
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
    const { root, host } = mounted!;
    act(() => root.unmount());
    host.remove();
    mounted = null;
    expect(pending.size).toBe(0);
  });
});

describe('spring-load: a collapsed row opens after the dwell, and puts itself back', () => {
  const collapsed = (): ReadonlySet<string> => useHudEditorViewStore.getState().collapsedNodeIds;

  /** Press on `a`, then hover `vault`, which is folded shut. */
  const hoverVault = (): void => {
    useHudEditorViewStore.setState({ collapsedNodeIds: new Set(['vault']) });
    layOut();
    const at = rowsInOrder().findIndex((row) => row.dataset.outlineRow === 'vault');
    act(() => { rowFor('a').dispatchEvent(pointer('pointerdown', 11)); });
    act(() => { window.dispatchEvent(pointer('pointermove', 40)); });
    act(() => { window.dispatchEvent(pointer('pointermove', at * ROW + 11)); });
  };

  it('waits 500 ms, shows the wait, then expands', () => {
    mountOutline();
    hoverVault();
    // The caret is turning: that is how "waiting" is told from "nothing will
    // happen", and it is the only animation in this design.
    expect(document.querySelector('.hud-outline__caret.is-springing')).not.toBeNull();
    act(() => { vi.advanceTimersByTime(499); });
    expect(collapsed().has('vault')).toBe(true);
    act(() => { vi.advanceTimersByTime(1); });
    expect(collapsed().has('vault')).toBe(false);
    expect(document.querySelector('.hud-outline__caret.is-springing')).toBeNull();
  });

  it('RE-COLLAPSES on a drop that landed somewhere else', () => {
    // A drag that leaves folders open behind it has damaged the view to do a
    // move; the author never asked for any of them.
    mountOutline();
    hoverVault();
    act(() => { vi.advanceTimersByTime(500); });
    layOut();
    act(() => { window.dispatchEvent(pointer('pointermove', 11)); });
    act(() => { window.dispatchEvent(pointer('pointerup', 11)); });
    expect(collapsed().has('vault')).toBe(true);
  });

  it('LEAVES IT OPEN when the drop landed inside it, because folding it would hide the move', () => {
    mountOutline();
    hoverVault();
    act(() => { vi.advanceTimersByTime(500); });
    layOut();
    const at = rowsInOrder().findIndex((row) => row.dataset.outlineRow === 'vault');
    // The lower half of `vault`'s own middle band: into vault, at the back.
    act(() => { window.dispatchEvent(pointer('pointermove', at * ROW + 14)); });
    act(() => { window.dispatchEvent(pointer('pointerup', at * ROW + 14)); });
    expect(collapsed().has('vault')).toBe(false);
  });

  it('puts it back on a CANCEL, because nothing landed', () => {
    mountOutline();
    hoverVault();
    act(() => { vi.advanceTimersByTime(500); });
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(collapsed().has('vault')).toBe(true);
  });

  it('resets the dwell when the pointer leaves before it fires', () => {
    mountOutline();
    hoverVault();
    act(() => { vi.advanceTimersByTime(400); });
    act(() => { window.dispatchEvent(pointer('pointermove', 11)); });
    act(() => { vi.advanceTimersByTime(400); });
    expect(collapsed().has('vault')).toBe(true);
    expect(document.querySelector('.hud-outline__caret.is-springing')).toBeNull();
  });
});
