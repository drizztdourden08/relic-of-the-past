/* @layer renderer-components @kind hook */
/**
 * useStickCalibration — state machine hook for 3-step stick calibration.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { webHidReader } from '../../../../../lib/input/hid-reader';
import {
  CENTER_SAMPLE_FRAMES,
  DEFAULT_INNER_DEADZONE,
  DEFAULT_OUTER_DEADZONE,
} from './types';
import type { DeviceStickCalibration, Step, StickCalibrationData } from './types';

interface Options {
  existingCalibration?: DeviceStickCalibration | null;
  target?: 'left' | 'right';
  deviceKey?: string;
}

const useStickCalibration = (options: Options) => {
  const { existingCalibration, target, deviceKey } = options;
  const [step, setStep] = useState<Step>('center');
  const calibrateLeft = target !== 'right';
  const calibrateRight = target !== 'left';

  // Raw 12-bit values (live)
  const [rawLX, setRawLX] = useState(2048);
  const [rawLY, setRawLY] = useState(2048);
  const [rawRX, setRawRX] = useState(2048);
  const [rawRY, setRawRY] = useState(2048);

  // Center calibration
  const centerSamplesRef = useRef<{ lx: number[]; ly: number[]; rx: number[]; ry: number[] }>({
    lx: [], ly: [], rx: [], ry: [],
  });
  const [centerDone, setCenterDone] = useState(false);
  const [centerProgress, setCenterProgress] = useState(0);
  const [centerValues, setCenterValues] = useState({ lx: 2048, ly: 2048, rx: 2048, ry: 2048 });

  // Range calibration
  const [rangeMinMax, setRangeMinMax] = useState({
    lxMin: 4095, lxMax: 0, lyMin: 4095, lyMax: 0,
    rxMin: 4095, rxMax: 0, ryMin: 4095, ryMax: 0,
  });
  const rangeMinMaxRef = useRef(rangeMinMax);
  const [rangeDone, setRangeDone] = useState(false);

  // Review deadzones
  const [innerDz, setInnerDz] = useState(
    existingCalibration?.left.innerDeadzone ?? DEFAULT_INNER_DEADZONE,
  );
  const [outerDz, setOuterDz] = useState(
    existingCalibration?.left.outerDeadzone ?? DEFAULT_OUTER_DEADZONE,
  );

  // Subscribe to input
  useEffect(() => {
    const unsub = webHidReader.onInput((state) => {
      if (deviceKey && state.deviceKey !== deviceKey) return;
      if (!state.rawSticks) return;
      const [lx, ly, rx, ry] = state.rawSticks;
      setRawLX(lx); setRawLY(ly); setRawRX(rx); setRawRY(ry);
    });
    return unsub;
  }, []);

  // Center sampling
  const startCenter = useCallback(() => {
    centerSamplesRef.current = { lx: [], ly: [], rx: [], ry: [] };
    setCenterDone(false);
    setCenterProgress(0);
  }, []);

  useEffect(() => {
    if (step !== 'center' || centerDone) return;
    const s = centerSamplesRef.current;
    s.lx.push(rawLX); s.ly.push(rawLY); s.rx.push(rawRX); s.ry.push(rawRY);
    const count = s.lx.length;
    setCenterProgress(Math.min(count / CENTER_SAMPLE_FRAMES, 1));
    if (count >= CENTER_SAMPLE_FRAMES) {
      const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
      setCenterValues({ lx: avg(s.lx), ly: avg(s.ly), rx: avg(s.rx), ry: avg(s.ry) });
      setCenterDone(true);
    }
  }, [step, centerDone, rawLX, rawLY, rawRX, rawRY]);

  // Range tracking
  useEffect(() => {
    if (step !== 'range') return;
    const prev = rangeMinMaxRef.current;
    const next = {
      lxMin: Math.min(prev.lxMin, rawLX), lxMax: Math.max(prev.lxMax, rawLX),
      lyMin: Math.min(prev.lyMin, rawLY), lyMax: Math.max(prev.lyMax, rawLY),
      rxMin: Math.min(prev.rxMin, rawRX), rxMax: Math.max(prev.rxMax, rawRX),
      ryMin: Math.min(prev.ryMin, rawRY), ryMax: Math.max(prev.ryMax, rawRY),
    };
    rangeMinMaxRef.current = next;
    setRangeMinMax(next);
    const minRange = 500;
    const leftOk = !calibrateLeft || (next.lxMax - next.lxMin > minRange && next.lyMax - next.lyMin > minRange);
    const rightOk = !calibrateRight || (next.rxMax - next.rxMin > minRange && next.ryMax - next.ryMin > minRange);
    if (leftOk && rightOk) setRangeDone(true);
  }, [step, rawLX, rawLY, rawRX, rawRY]);

  // Build calibration data
  const buildCalibration = useCallback((): DeviceStickCalibration => {
    const defaultCal: StickCalibrationData = {
      centerX: 2048, centerY: 2048, minX: 0, maxX: 4095, minY: 0, maxY: 4095,
      innerDeadzone: DEFAULT_INNER_DEADZONE, outerDeadzone: DEFAULT_OUTER_DEADZONE,
    };
    const left: StickCalibrationData = calibrateLeft ? {
      centerX: centerValues.lx, centerY: centerValues.ly,
      minX: rangeMinMax.lxMin, maxX: rangeMinMax.lxMax,
      minY: rangeMinMax.lyMin, maxY: rangeMinMax.lyMax,
      innerDeadzone: innerDz, outerDeadzone: outerDz,
    } : (existingCalibration?.left ?? defaultCal);
    const right: StickCalibrationData = calibrateRight ? {
      centerX: centerValues.rx, centerY: centerValues.ry,
      minX: rangeMinMax.rxMin, maxX: rangeMinMax.rxMax,
      minY: rangeMinMax.ryMin, maxY: rangeMinMax.ryMax,
      innerDeadzone: innerDz, outerDeadzone: outerDz,
    } : (existingCalibration?.right ?? defaultCal);
    return { left, right, updatedAt: new Date().toISOString() };
  }, [centerValues, rangeMinMax, innerDz, outerDz, calibrateLeft, calibrateRight, existingCalibration]);

  // Navigation helpers
  const goToRange = useCallback(() => {
    const mm = {
      lxMin: centerValues.lx, lxMax: centerValues.lx,
      lyMin: centerValues.ly, lyMax: centerValues.ly,
      rxMin: centerValues.rx, rxMax: centerValues.rx,
      ryMin: centerValues.ry, ryMax: centerValues.ry,
    };
    rangeMinMaxRef.current = mm;
    setRangeMinMax(mm);
    setRangeDone(false);
    setStep('range');
  }, [centerValues]);

  const restart = useCallback(() => {
    startCenter();
    setStep('center');
  }, [startCenter]);

  return {
    step, setStep,
    calibrateLeft, calibrateRight,
    rawLX, rawLY, rawRX, rawRY,
    centerDone, centerProgress, centerValues, startCenter,
    rangeMinMax, rangeDone,
    innerDz, setInnerDz, outerDz, setOuterDz,
    buildCalibration,
    goToRange, restart,
  };
};

export { useStickCalibration };
