/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import { MIN_STICK_RANGE, STICK_RANGE_EMPTY } from '../stick-calibration.constants';
import type { Step, StickQuad, StickRangeBounds } from '../stick-calibration.type';

const extendRange = (prev: StickRangeBounds, raw: StickQuad): StickRangeBounds => ({
  lxMin: Math.min(prev.lxMin, raw.lx), lxMax: Math.max(prev.lxMax, raw.lx),
  lyMin: Math.min(prev.lyMin, raw.ly), lyMax: Math.max(prev.lyMax, raw.ly),
  rxMin: Math.min(prev.rxMin, raw.rx), rxMax: Math.max(prev.rxMax, raw.rx),
  ryMin: Math.min(prev.ryMin, raw.ry), ryMax: Math.max(prev.ryMax, raw.ry),
});

const rangeAt = (c: StickQuad): StickRangeBounds => ({
  lxMin: c.lx, lxMax: c.lx, lyMin: c.ly, lyMax: c.ly,
  rxMin: c.rx, rxMax: c.rx, ryMin: c.ry, ryMax: c.ry,
});

const spans = (min: number, max: number): boolean => max - min > MIN_STICK_RANGE;

const useRangeTracking = (step: Step, raw: StickQuad, calibrateLeft: boolean, calibrateRight: boolean) => {
  const [rangeMinMax, setRangeMinMax] = useState<StickRangeBounds>(STICK_RANGE_EMPTY);
  const rangeRef = useRef(rangeMinMax);
  const [rangeDone, setRangeDone] = useState(false);

  useEffect(() => {
    if (step !== 'range') return;
    const next = extendRange(rangeRef.current, raw);
    rangeRef.current = next;
    setRangeMinMax(next);
    const leftOk = !calibrateLeft || (spans(next.lxMin, next.lxMax) && spans(next.lyMin, next.lyMax));
    const rightOk = !calibrateRight || (spans(next.rxMin, next.rxMax) && spans(next.ryMin, next.ryMax));
    if (leftOk && rightOk) setRangeDone(true);
  }, [step, raw, calibrateLeft, calibrateRight]);

  const resetRange = useCallback((center: StickQuad) => {
    const start = rangeAt(center);
    rangeRef.current = start;
    setRangeMinMax(start);
    setRangeDone(false);
  }, []);

  return { rangeMinMax, rangeDone, resetRange };
};

export { useRangeTracking };
