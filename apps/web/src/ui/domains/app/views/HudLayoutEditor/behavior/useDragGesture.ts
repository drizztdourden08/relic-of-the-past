/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDismissable } from '@ds/primitives/Portal';
import { SLOP } from './useDragGesture.constants';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { Armed, DragGesture, DragGestureInput } from './useDragGesture.type';

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

  useDismissable({ active: sourceId !== null, level: 'drag', onDismiss: reset });

  const start = useCallback((event: ReactPointerEvent, id: string) => {
    if (event.button !== 0) return;
    armed.current = {
      sourceId: id, x: event.clientX, y: event.clientY, pointerId: event.pointerId, target: event.currentTarget as HTMLElement,
    };
  }, []);

  return { sourceId, payload, start, cancel: reset };
};

export { useDragGesture };
export type { DragGesture, DragGestureInput } from './useDragGesture.type';
