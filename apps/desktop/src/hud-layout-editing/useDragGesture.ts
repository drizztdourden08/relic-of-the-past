/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useEscapeStack } from '@drizztdourden08/tessera/primitives';
import { SLOP } from './drag-gesture.constants';
import { releaseCapture } from './release-capture';
import { swallowNextClick } from './swallow-next-click';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { Armed, DragGesture, DragGestureInput } from './drag-gesture.type';

const useDragGesture = <T,>(input: DragGestureInput<T>): DragGesture<T> => {
  const { resolve, commit, same, threshold = SLOP } = input;
  const armed = useRef<Armed | null>(null);
  const live = useRef<{ sourceId: string; payload: T | null } | null>(null);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [payload, setPayload] = useState<T | null>(null);
  const api = useRef({ resolve, commit, same });
  api.current = { resolve, commit, same };

  const reset = useCallback(() => {
    releaseCapture(armed.current);
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
      swallowNextClick();
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

  useEscapeStack({ active: sourceId !== null, level: 'drag', onEscape: reset });

  const start = useCallback((event: ReactPointerEvent, id: string) => {
    if (event.button !== 0) return;
    armed.current = {
      sourceId: id, x: event.clientX, y: event.clientY, pointerId: event.pointerId, target: event.currentTarget,
    };
  }, []);

  return { sourceId, payload, start, cancel: reset };
};

export { useDragGesture };
export type { DragGesture, DragGestureInput } from './drag-gesture.type';
