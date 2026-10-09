/* @layer renderer-components @kind hook */
import { useState, useEffect, useRef, useCallback } from 'react';
import { controllerInputStore } from '../../../../../../../lib/input/controller-input-store';
import {
  CENTER_SAMPLE_FRAMES,
  DEFAULT_INNER_DEADZONE,
  DEFAULT_OUTER_DEADZONE,
  MIN_STICK_RANGE,
  STICK_RAW_CENTER,
  STICK_RAW_MAX,
} from './stick-calibration.constants';
import type {
  DeviceStickCalibration, Step, StickCalibrationData, UseStickCalibrationOptions,
} from './stick-calibration.type';

const useStickCalibration = (options: UseStickCalibrationOptions) => {
  const { existingCalibration, target, deviceKey } = options;
  const [step, setStep] = useState<Step>('center');
  const calibrateLeft = target !== 'right';
  const calibrateRight = target !== 'left';

  const [rawLX, setRawLX] = useState(STICK_RAW_CENTER);
  const [rawLY, setRawLY] = useState(STICK_RAW_CENTER);
  const [rawRX, setRawRX] = useState(STICK_RAW_CENTER);
  const [rawRY, setRawRY] = useState(STICK_RAW_CENTER);

  const centerSamplesRef = useRef<{ lx: number[]; ly: number[]; rx: number[]; ry: number[] }>({
    lx: [], ly: [], rx: [], ry: [],
  });
  const [centerDone, setCenterDone] = useState(false);
  const [centerProgress, setCenterProgress] = useState(0);
  const [centerValues, setCenterValues] = useState({
    lx: STICK_RAW_CENTER, ly: STICK_RAW_CENTER, rx: STICK_RAW_CENTER, ry: STICK_RAW_CENTER,
  });

  const [rangeMinMax, setRangeMinMax] = useState({
    lxMin: STICK_RAW_MAX, lxMax: 0, lyMin: STICK_RAW_MAX, lyMax: 0,
    rxMin: STICK_RAW_MAX, rxMax: 0, ryMin: STICK_RAW_MAX, ryMax: 0,
  });
  const rangeMinMaxRef = useRef(rangeMinMax);
  const [rangeDone, setRangeDone] = useState(false);

  const [innerDz, setInnerDz] = useState(
    existingCalibration?.left.innerDeadzone ?? DEFAULT_INNER_DEADZONE,
  );
  const [outerDz, setOuterDz] = useState(
    existingCalibration?.left.outerDeadzone ?? DEFAULT_OUTER_DEADZONE,
  );

  useEffect(() => {
    const unsub = controllerInputStore.onInput((state) => {
      if (deviceKey && state.deviceKey !== deviceKey) return;
      if (!state.rawSticks) return;
      const [lx, ly, rx, ry] = state.rawSticks;
      setRawLX(lx); setRawLY(ly); setRawRX(rx); setRawRY(ry);
    });
    return unsub;
  }, []);

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
    const leftOk = !calibrateLeft || (next.lxMax - next.lxMin > MIN_STICK_RANGE && next.lyMax - next.lyMin > MIN_STICK_RANGE);
    const rightOk = !calibrateRight || (next.rxMax - next.rxMin > MIN_STICK_RANGE && next.ryMax - next.ryMin > MIN_STICK_RANGE);
    if (leftOk && rightOk) setRangeDone(true);
  }, [step, rawLX, rawLY, rawRX, rawRY]);

  const buildCalibration = useCallback((): DeviceStickCalibration => {
    const defaultCal: StickCalibrationData = {
      centerX: STICK_RAW_CENTER, centerY: STICK_RAW_CENTER, minX: 0, maxX: STICK_RAW_MAX, minY: 0, maxY: STICK_RAW_MAX,
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
