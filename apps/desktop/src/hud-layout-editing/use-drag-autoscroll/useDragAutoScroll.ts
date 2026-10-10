/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef } from 'react';
import { repeatMove } from '../repeat-move';
import { rateFor } from './rate-for';
import { scrollerFor } from './scroller-for';
import { RATE } from './use-drag-autoscroll.constants';
import type { DragAutoScrollInput, Scrollable } from './use-drag-autoscroll.type';

const reducedMotion = (): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const contains = (rect: Scrollable, x: number, y: number): boolean =>
  x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

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
      if (!found || rate === 0) return;
      found.el.scrollTop += rate;
      frame.current = requestAnimationFrame(tick);
      repeatMove(at);
    };

    const onMove = (event: PointerEvent | MouseEvent): void => {
      last.current = event;
      frame.current ??= requestAnimationFrame(tick);
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

export { useDragAutoScroll };
