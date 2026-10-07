/* @layer renderer-hud @kind hook */
/**
 * Counts the pie's motion in whole steps, the way the console paces its own animations. The count
 * restarts each time a slice goes, so the slice that left runs its exit steps from the first one and
 * the new next slice starts its pulse on the bright colour. A viewer who asked for reduced motion
 * gets no steps at all: slices disappear and nothing pulses.
 */
import { useEffect, useState } from 'react';
import { EXIT_STEPS, PULSE_LEVELS, PULSE_STEP_TICKS, STEP_MS } from '../HudPixelPie.constants';

interface StepClock {
  /** Slices in place when the count last restarted. */
  left: number;
  /** Slices in place before that, which tells a slice leaving from a countdown starting over. */
  from: number;
  ticks: number;
}

const reducedMotion = (): boolean =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const usePieSteps = (slicesLeft: number) => {
  const [clock, setClock] = useState<StepClock>({ left: slicesLeft, from: slicesLeft, ticks: 0 });
  // A changed slice count restarts the clock during render, so no frame shows the old steps.
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
