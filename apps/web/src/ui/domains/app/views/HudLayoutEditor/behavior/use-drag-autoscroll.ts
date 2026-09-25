/* @layer renderer-components @kind hook */
/**
 * THE OUTLINE'S DRAG REACHES PAST THE FOLD with a ramped rAF pan on its scroller.
 *
 * ONE SURFACE, because one surface takes a drop. §45 wrote this against two
 * surfaces (the outline's rail and the centre column the stage sits in), but §46 removed
 * the stage's drop surface entirely, and a scroller that pans under a drag it
 * can never accept is just a surface that moves for no reason. That was always
 * the argument for leaving the inspector out; it now applies to the stage
 * column too.
 *
 * DEPTH IN THE BAND IS SPEED. `RATE` is ramped linearly across `HOT` instead of
 * held constant, because a constant rate makes the band a cliff: you either
 * overshoot the list or crawl. Ramping gives the gesture the one control it can
 * offer, and it is the reason the band is drawn (`.is-autoscroll`) instead of
 * discovered.
 *
 * IT PANS ONLY WHILE THE POINTER IS IN IT. "The scroller whose rect contains
 * the point" is a complete rule and not a heuristic, and it is what stops a
 * drag that has wandered off the rail from still dragging the list along.
 *
 * THE TARGET KEEPS RESOLVING WHILE IT SCROLLS. A scroll that does not re-run the
 * hit test is the bug that makes auto-scroll feel broken: rows slide under a
 * stationary cursor and the ghost keeps naming the one that WAS there. So each
 * frame that actually moved the scroller re-emits the pointer's own last
 * position.
 *
 * IT IS A rAF, NEVER A `setInterval`: it has to be locked to the same clock the
 * ghost moves on, or the card and the list disagree about where the pointer is.
 *
 * CANCELLATION IS THE PART THAT MATTERS. A leaked frame after a drop keeps
 * panning a list nobody is dragging over, so the loop is stopped four
 * independent ways: `active` going false (the drop, and `Escape` through the
 * gesture's own reset), `pointerup`, `pointercancel`/`blur`, and the effect's
 * own teardown. Any one of them is sufficient; all four are wired because this
 * is the defect the phase would most plausibly ship.
 *
 * `prefers-reduced-motion` HALVES THE RATE AND NEVER DISABLES IT. Disabling
 * makes a drop target unreachable, which is a worse accessibility
 * outcome than the motion. The keyboard path (§45) is the real answer for
 * anyone who cannot use the drag at all. It is read once per drag instead of
 * as a hook, because the OS setting changing mid-gesture is not a case worth
 * wiring and `window.matchMedia` does not exist in every host this mounts in.
 */
import { useCallback, useEffect, useRef } from 'react';
import { repeatMove } from './useDragGesture';
import type { RefObject } from 'react';

/** Display px at each end of a scroller that pan while a drag is over them.
 *  One outline row plus a margin: deep enough to enter deliberately, shallow
 *  enough that the last real row is still droppable. */
const HOT = 24;
/** Px per frame at the very edge of the band; 0 at its inner lip. */
const RATE = 14;

interface Scrollable { top: number; bottom: number; left: number; right: number }

/**
 * Px to scroll this frame: negative up, positive down, 0 outside the bands.
 * Exported because the ramp IS the design decision, so a test pins it
 * without a DOM.
 */
const rateFor = (rect: Scrollable, y: number, max: number): number => {
  if (y < rect.top || y > rect.bottom) return 0;
  const fromTop = y - rect.top;
  const fromBottom = rect.bottom - y;
  if (fromTop < HOT) return -max * (1 - fromTop / HOT);
  if (fromBottom < HOT) return max * (1 - fromBottom / HOT);
  return 0;
};

const reducedMotion = (): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const contains = (rect: Scrollable, x: number, y: number): boolean =>
  x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

/**
 * The nearest ancestor that can actually scroll, starting at the element
 * itself. WHICH element that is is a CSS decision. §45 found that the brief's
 * own `.hud-outline__rows` was not a scroller at all until it was made one, and
 * a gesture that hard-coded it would break the day a sheet moved. So the surface
 * hands over any element inside itself and this finds the scroller.
 */
const scrollerFor = (element: HTMLElement | null): HTMLElement | null => {
  for (let node = element; node; node = node.parentElement) {
    if (node.scrollHeight - node.clientHeight > 1) return node;
  }
  return null;
};

interface DragAutoScrollInput {
  /** Live only while a drag is; false is what stops the loop on the drop and on
   *  `Escape`, because both reset the gesture's own `sourceId`. */
  active: boolean;
  /** Any element inside the surface this drag may pan. The scroller itself is
   *  resolved from it, because WHICH element scrolls is a CSS decision. */
  anchor: RefObject<HTMLElement | null>;
}

const useDragAutoScroll = (input: DragAutoScrollInput): void => {
  const { active, anchor } = input;
  const frame = useRef<number | null>(null);
  const last = useRef<PointerEvent | MouseEvent | null>(null);
  const ref = useRef(anchor);
  ref.current = anchor;

  const stop = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    last.current = null;
  }, []);

  useEffect(() => {
    if (!active) { stop(); return undefined; }
    const max = reducedMotion() ? RATE / 2 : RATE;

    const tick = (): void => {
      frame.current = null;
      const at = last.current;
      if (!at) return;
      const el = scrollerFor(ref.current.current);
      const rect = el?.getBoundingClientRect();
      const found = el && rect && contains(rect, at.clientX, at.clientY) ? { el, rect } : null;
      const rate = found ? rateFor(found.rect, at.clientY, max) : 0;
      // Not re-scheduling IS the stop: the band was left, or there is nothing
      // left to scroll.
      if (!found || rate === 0) return;
      found.el.scrollTop += rate;
      frame.current = requestAnimationFrame(tick);
      repeatMove(at);
    };

    const onMove = (event: PointerEvent | MouseEvent): void => {
      last.current = event;
      if (frame.current === null) frame.current = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', onMove as EventListener);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    window.addEventListener('blur', stop);
    return () => {
      window.removeEventListener('pointermove', onMove as EventListener);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
      window.removeEventListener('blur', stop);
      stop();
    };
  }, [active, stop]);
};

export { HOT, RATE, rateFor, scrollerFor, useDragAutoScroll };
export type { DragAutoScrollInput };
