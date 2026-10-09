/* @layer renderer-hud @kind hook */
import { useEffect, useState } from 'react';
import { EXIT_STEPS, PULSE_LEVELS, PULSE_STEP_TICKS, STEP_MS } from '../HudPixelPie.constants';
import type { StepClock } from '../HudPixelPie.type';

const reducedMotion = (): boolean =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const usePieSteps = (slicesLeft: number) => {
  const [clock, setClock] = useState<StepClock>({ left: slicesLeft, from: slicesLeft, ticks: 0 });
  if (clock.left !== slicesLeft) setClock({ left: slicesLeft, from: clock.left, ticks: 0 });

  const still = reducedMotion();
  useEffect(() => {
    if (still) return;
    const id = window.setInterval(() => setClock((prev) => ({ ...prev, ticks: prev.ticks + 1 })), STEP_MS);
    return () => window.clearInterval(id);
  }, [slicesLeft, still]);

  const ticks = clock.left === slicesLeft ? clock.ticks : 0;
  const isLeaving = !still && clock.from > slicesLeft && ticks < EXIT_STEPS;
  return {
    leavingStep: isLeaving ? ticks + 1 : 0,
    pulseStep: still ? 0 : Math.floor(ticks / PULSE_STEP_TICKS) % PULSE_LEVELS.length,
  };
};

export { usePieSteps };
