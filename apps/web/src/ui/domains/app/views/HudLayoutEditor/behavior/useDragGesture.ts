/* @layer renderer-components @kind hook */
/**
 * THE OUTLINE'S DROP GESTURE. Yes, this contradicts a header already in
 * the tree.
 *
 * IT HAD TWO CALLERS AND NOW HAS ONE (§47). The stage's margin nudge was the
 * other; the stage selects and nothing else now, so every word below is about
 * the outline's drag, which is the gesture this was always mostly for.
 *
 * `ResizeHandle`/`use-resize.ts` says the HTML5 drag API "exists to carry a
 * thing to a drop target, firing a coarse, throttled stream with a mandatory
 * drag image and a destination. A resize is the opposite gesture". That is
 * right, and it is why a resize uses pointer events. The outline's drag
 * IS carrying a thing to a drop target. It still loses, for two
 * reasons the resize never had:
 *
 *  - THE MANDATORY DRAG IMAGE FIGHTS THE GHOST. The drag image is a snapshot
 *    taken once at `dragstart`; the ghost is a card whose content changes every
 *    few pixels. Cancelling the drag image is a per-platform hack.
 *  - `dragover` IS COARSE AND THROTTLED, and the zone arithmetic needs a real
 *    point every frame.
 *
 * WHAT IS KEPT FROM `useResize` IS THE DISCIPLINE, which is the more valuable
 * half: pointer capture, a slop threshold before anything happens, PREVIEW on
 * every move and COMMIT EXACTLY ONCE on release.
 *
 * THE DRAG NEVER TOUCHES THE DOCUMENT. `resolve` is pure and answers what the
 * drop WOULD do, and `commit` is called once, on `pointerup`. Two things fall
 * out that are worth more than the tidiness: cancel becomes free
 * (nothing was written, so there is nothing to roll back), and the tree stops
 * being re-solved under the pointer mid-drag. It fixes a shipped defect.
 * §37's stage nudge called `onOffset` on EVERY `pointermove`, so a one-second
 * drag was dozens of document writes. The discipline outlived the gesture
 * that exposed it. ONE DRAG IS ONE EDIT, counted in
 * `tests/hud/hud-drag-gesture.keep.test.ts`.
 *
 * CAPTURE IS TAKEN LATE, at the threshold instead of at the press, so a click
 * that wobbles is still a click: the row's own button keeps receiving it. Once
 * the gesture is real, capture both keeps the pointer reporting here after it
 * has left the source and swallows the trailing `click`.
 *
 * `Escape` CANCELS THE DRAG AND NOTHING ELSE. It registers on §33's dismiss
 * stack at the new `drag` level, above `popover`: a picker left open under a
 * live drag must not be what a press reaches, because the drag is what the hand
 * is doing.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDismissable } from '@ds/primitives/Portal';
import type { PointerEvent as ReactPointerEvent } from 'react';

/** Below this a press is a click that happened to wobble, not a drag. */
const SLOP = 2;

interface DragGestureInput<T> {
  /** What the drop WOULD do, from the pointer's live position and whatever is
   *  being carried. Pure: it may read the document, never write one. */
  resolve: (event: PointerEvent, sourceId: string) => T | null;
  /** Called ONCE, on release, with the last thing `resolve` answered. */
  commit: (payload: T, sourceId: string) => void;
  /** Suppresses a re-render when two frames resolve to the same thing. */
  same?: (a: T, b: T) => boolean;
  threshold?: number;
}

interface DragGesture<T> {
  /** The node being carried. Null until the slop threshold is passed, so a
   *  click never lights an indicator. */
  sourceId: string | null;
  /** The live preview. Never written to the document. */
  payload: T | null;
  start: (event: ReactPointerEvent, sourceId: string) => void;
  cancel: () => void;
}

interface Armed { sourceId: string; x: number; y: number; pointerId: number; target: HTMLElement }

/** Re-emit the pointer's last position, so the gesture re-resolves although the
 *  pointer has not moved. Auto-scroll needs it and would otherwise go stale
 *  under a stationary cursor: it slides new rows under one, and a hit test that
 *  only runs on `pointermove` keeps naming the row that WAS there. */
const repeatMove = (from: { clientX: number; clientY: number }): void => {
  window.dispatchEvent(new MouseEvent('pointermove', {
    bubbles: true, clientX: from.clientX, clientY: from.clientY,
  }));
};

const useDragGesture = <T,>(input: DragGestureInput<T>): DragGesture<T> => {
  const { resolve, commit, same, threshold = SLOP } = input;
  const armed = useRef<Armed | null>(null);
  const live = useRef<{ sourceId: string; payload: T | null } | null>(null);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [payload, setPayload] = useState<T | null>(null);
  const api = useRef({ resolve, commit, same });
  api.current = { resolve, commit, same };

  const reset = useCallback(() => {
    const held = armed.current;
    if (held?.target.hasPointerCapture?.(held.pointerId)) held.target.releasePointerCapture(held.pointerId);
    armed.current = null;
    live.current = null;
    setSourceId(null);
    setPayload(null);
  }, []);

  useEffect(() => {
    const onMove = (event: PointerEvent): void => {
      const held = armed.current;
      if (!held) return;
      if (!live.current) {
        if (Math.abs(event.clientX - held.x) < threshold && Math.abs(event.clientY - held.y) < threshold) return;
        held.target.setPointerCapture?.(held.pointerId);
        live.current = { sourceId: held.sourceId, payload: null };
        setSourceId(held.sourceId);
      }
      const next = api.current.resolve(event, live.current.sourceId);
      const previous = live.current.payload;
      live.current.payload = next;
      if (previous !== null && next !== null && api.current.same?.(previous, next)) return;
      setPayload(next);
    };
    const onUp = (): void => {
      const running = live.current;
      const source = armed.current?.sourceId ?? null;
      const settled = running?.payload ?? null;
      reset();
      if (!running) return;
      // A real drag must not also read as a click. `mousedown` and `mouseup` on
      // two different rows still synthesise one `click` on their common
      // ancestor, and on a drag that ended where it began it lands on the
      // source row's own name button, which would select whatever was just
      // carried. One capture-phase swallow, and only after a gesture that
      // actually happened.
      const swallow = (event: MouseEvent): void => { event.stopPropagation(); event.preventDefault(); };
      window.addEventListener('click', swallow, { capture: true, once: true });
      setTimeout(() => window.removeEventListener('click', swallow, { capture: true }), 0);
      if (settled !== null && source) api.current.commit(settled, source);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', reset);
    window.addEventListener('blur', reset);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', reset);
      window.removeEventListener('blur', reset);
    };
  }, [reset, threshold]);

  // Registered only while a drag is actually live, so a press that never moved
  // owns no key and `Escape` reaches whatever is above it.
  useDismissable({ active: sourceId !== null, level: 'drag', onDismiss: reset });

  const start = useCallback((event: ReactPointerEvent, id: string) => {
    if (event.button !== 0) return;
    armed.current = {
      sourceId: id, x: event.clientX, y: event.clientY, pointerId: event.pointerId, target: event.currentTarget as HTMLElement,
    };
  }, []);

  return { sourceId, payload, start, cancel: reset };
};

export { SLOP, repeatMove, useDragGesture };
export type { DragGesture, DragGestureInput };
