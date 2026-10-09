/* @layer renderer-hud @kind hook */
import { useEffect, useRef, useState } from 'react';

const useMotionClock = (active: boolean, override?: number | null): number => {
  const [nowMs, setNowMs] = useState(0);
  const startRef = useRef<number | null>(null);
  const parked = typeof override === 'number';

  useEffect(() => {
    if (!active || parked) {
      startRef.current = null;
      return undefined;
    }
    let frame = 0;
    const tick = (t: number): void => {
      if (startRef.current === null) startRef.current = t;
      setNowMs(t - startRef.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, parked]);

  if (parked) return Math.max(0, override as number);
  return active ? nowMs : 0;
};

export { useMotionClock };
