/* @layer renderer-components @kind hook */
import { useState, useCallback } from 'react';
import { applyTriggerCalibration } from '@drizztdourden08/brock-input';
import { DEFAULT_DEADZONE } from '../trigger-calibration.constants';
import type { Step, UseTriggerCalibrationOptions } from '../trigger-calibration.type';
import { useTriggerReadings } from './useTriggerReadings';

const useTriggerCalibration = (options: UseTriggerCalibrationOptions) => {
  const { existingCalibration } = options;
  const [step, setStep] = useState<Step>('rest');
  const readings = useTriggerReadings({ ...options, step });
  const { rawValue, baseValue, maxValue, startMax } = readings;
  const [deadzone, setDeadzone] = useState(existingCalibration?.deadzone ?? DEFAULT_DEADZONE);

  const calibratedValue = useCallback(
    () => applyTriggerCalibration(rawValue, { base: baseValue, max: maxValue, deadzone }),
    [rawValue, baseValue, maxValue, deadzone],
  );

  const advanceToMax = useCallback(() => {
    startMax();
    setStep('max');
  }, [startMax]);

  return {
    step, setStep,
    rawValue, rawByte: readings.rawByte,
    restDone: readings.restDone, restProgress: readings.restProgress, baseValue,
    maxValue,
    deadzone, setDeadzone,
    calibratedValue,
    resetRest: readings.resetRest,
    advanceToMax,
  };
};

export { useTriggerCalibration };
