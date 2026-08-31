/* @layer renderer-widgets @kind hook */
/**
 * Holds the pending value for one stat control and turns a percentage into a legal engine value.
 *
 * A percentage is read as a fraction of the stat's own range, not of its maximum: the capacity
 * stats start at a floor the game will not go below (one heart, ten bombs, thirty arrows), and
 * interpolating across the range lands each quarter on a real upgrade tier instead of below the
 * floor. The pending value is also re-clamped on every read, so a cap that shrinks while the widget
 * is open can never leave the control offering a value the engine would refuse.
 */
import { useCallback, useState } from 'react';
import type { StatSpec } from '../StatsTab.type';

const snapToStep = (value: number, step: number): number => Math.round(value / step) * step;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const useStatValue = (spec: StatSpec) => {
  const { min, max, step, apply } = spec;
  const [pending, setPending] = useState(max);
  const value = clamp(pending, min, max);

  const setValue = useCallback((next: number) => setPending(next), []);

  const applyValue = useCallback(() => apply(clamp(snapToStep(value, step), min, max)), [apply, value, step, min, max]);

  const applyPercent = useCallback((percent: number) => {
    const next = clamp(snapToStep(min + ((max - min) * percent) / 100, step), min, max);
    setPending(next);
    apply(next);
  }, [apply, min, max, step]);

  return { value, setValue, applyValue, applyPercent };
};

export { useStatValue };
