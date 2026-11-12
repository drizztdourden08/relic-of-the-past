/* @layer renderer-app @kind hook */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PxPoint } from '@rotp/input-mapping';
import { HOLD_RING_DELAY_MS, HOLD_SLOP_PX } from '../TouchControls.constants';
import type { HoldRingState, MenuHold } from '../TouchControls.type';

interface ActiveHold {
  pointerId: number;
  origin: PxPoint;
  startedAt: number;
}

/** A finger that rests on empty space for holdMs calls onOpen; the ring shows the last stretch of the wait. */
const useMenuHold = (holdMs: number, onOpen: () => void): MenuHold => {
  const [ring, setRing] = useState<HoldRingState | null>(null);
  const active = useRef<ActiveHold | null>(null);
  const frame = useRef(0);
  const openRef = useRef(onOpen);
  openRef.current = onOpen;

  const cancel = useCallback(() => {
    cancelAnimationFrame(frame.current);
    active.current = null;
    setRing(null);
  }, []);

  const tick = useCallback(() => {
    const hold = active.current;
    if (!hold) return;
    const elapsed = performance.now() - hold.startedAt;
    if (elapsed >= holdMs) {
      cancel();
      openRef.current();
      return;
    }
    if (elapsed >= HOLD_RING_DELAY_MS) {
      setRing({ center: hold.origin, progress: (elapsed - HOLD_RING_DELAY_MS) / (holdMs - HOLD_RING_DELAY_MS) });
    }
    frame.current = requestAnimationFrame(tick);
  }, [holdMs, cancel]);

  const begin = useCallback((pointerId: number, point: PxPoint) => {
    cancelAnimationFrame(frame.current);
    active.current = { pointerId, origin: point, startedAt: performance.now() };
    frame.current = requestAnimationFrame(tick);
  }, [tick]);

  const move = useCallback((pointerId: number, point: PxPoint) => {
    const hold = active.current;
    if (hold?.pointerId !== pointerId) return;
    if (Math.hypot(point.x - hold.origin.x, point.y - hold.origin.y) > HOLD_SLOP_PX) cancel();
  }, [cancel]);

  const end = useCallback((pointerId: number) => {
    if (active.current?.pointerId === pointerId) cancel();
  }, [cancel]);

  useEffect(() => cancel, [cancel]);

  return useMemo(() => ({ ring, begin, move, end, cancel }), [ring, begin, move, end, cancel]);
};

export { useMenuHold };
