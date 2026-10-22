/* @layer renderer-components @kind hook */
import { useState, useCallback } from 'react';
import type { DeviceStickCalibration } from '@drizztdourden08/brock-input';
import { DEFAULT_INNER_DEADZONE, DEFAULT_OUTER_DEADZONE } from '../stick-calibration.constants';
import type { Step, UseStickCalibrationOptions } from '../stick-calibration.type';
import { buildStickCalibration } from '../build-stick-calibration';
import { useCenterSampling } from './useCenterSampling';
import { useRangeTracking } from './useRangeTracking';
import { useRawSticks } from './useRawSticks';

const useStickCalibration = (options: UseStickCalibrationOptions) => {
  const { existingCalibration, target, deviceKey } = options;
  const [step, setStep] = useState<Step>('center');
  const calibrateLeft = target !== 'right';
  const calibrateRight = target !== 'left';
  const raw = useRawSticks(deviceKey);
  const { centerDone, centerProgress, centerValues, startCenter } = useCenterSampling(step, raw);
  const { rangeMinMax, rangeDone, resetRange } = useRangeTracking(step, raw, calibrateLeft, calibrateRight);
  const [innerDz, setInnerDz] = useState(existingCalibration?.left.innerDeadzone ?? DEFAULT_INNER_DEADZONE);
  const [outerDz, setOuterDz] = useState(existingCalibration?.left.outerDeadzone ?? DEFAULT_OUTER_DEADZONE);

  const buildCalibration = useCallback((): DeviceStickCalibration => buildStickCalibration({
    calibrateLeft, calibrateRight, centerValues, rangeMinMax, innerDz, outerDz, existingCalibration,
  }), [centerValues, rangeMinMax, innerDz, outerDz, calibrateLeft, calibrateRight, existingCalibration]);

  const goToRange = useCallback(() => {
    resetRange(centerValues);
    setStep('range');
  }, [centerValues, resetRange]);

  const restart = useCallback(() => {
    startCenter();
    setStep('center');
  }, [startCenter]);

  return {
    step, setStep,
    calibrateLeft, calibrateRight,
    rawLX: raw.lx, rawLY: raw.ly, rawRX: raw.rx, rawRY: raw.ry,
    centerDone, centerProgress, centerValues, startCenter,
    rangeMinMax, rangeDone,
    innerDz, setInnerDz, outerDz, setOuterDz,
    buildCalibration,
    goToRange, restart,
  };
};

export { useStickCalibration };
