/* @layer website-site @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import { HOLD_MS, STEP_MS } from '../RatiosVisual.constants';

const nextStep = (current: number | null, count: number): number | null => {
  if (current === null) return 0;
  return current + 1 >= count ? null : current + 1;
};

const useRatioLoop = (count: number, reduced: boolean) => {
  const [active, setActive] = useState<number | null>(null);
  const [holding, setHolding] = useState(false);
  const holdTimer = useRef<number>(0);

  useEffect(() => {
    if (reduced || holding) return undefined;
    const timer = window.setInterval(() => setActive((current) => nextStep(current, count)), STEP_MS);
    return () => window.clearInterval(timer);
  }, [count, holding, reduced]);

  useEffect(() => () => window.clearTimeout(holdTimer.current), []);

  const select = useCallback((index: number) => {
    setActive(index);
    setHolding(true);
    window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(() => setHolding(false), HOLD_MS);
  }, []);

  return { active, select };
};

export { useRatioLoop };
