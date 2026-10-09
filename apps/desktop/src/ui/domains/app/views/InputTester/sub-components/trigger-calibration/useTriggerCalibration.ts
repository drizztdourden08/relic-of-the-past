/* @layer renderer-components @kind hook */
import { useState, useEffect, useRef, useCallback } from 'react';
import { controllerInputStore } from '../../../../../../../lib/input/controller-input-store';
import {
  DEFAULT_DEADZONE, LEFT_TRIGGER_AXIS, LEFT_TRIGGER_BYTE,
  REST_SAMPLE_FRAMES, RIGHT_TRIGGER_AXIS, RIGHT_TRIGGER_BYTE,
} from './trigger-calibration.constants';
import type { Step, UseTriggerCalibrationOptions } from './trigger-calibration.type';

const useTriggerCalibration = (options: UseTriggerCalibrationOptions) => {
  const { axisIndex, deviceKey, existingCalibration } = options;

  const [step, setStep] = useState<Step>('rest');
  const [rawValue, setRawValue] = useState(0);
  const [rawByte, setRawByte] = useState<number | null>(null);

  const restSamplesRef = useRef<number[]>([]);
  const [restDone, setRestDone] = useState(false);
  const [restProgress, setRestProgress] = useState(0);
  const [baseValue, setBaseValue] = useState(existingCalibration?.base ?? 0);

  const [maxValue, setMaxValue] = useState(existingCalibration?.max ?? 0);
  const maxRef = useRef(0);

  const [deadzone, setDeadzone] = useState(existingCalibration?.deadzone ?? DEFAULT_DEADZONE);

  const stepRef = useRef<Step>(step);
  stepRef.current = step;
  const restDoneRef = useRef(restDone);
  restDoneRef.current = restDone;

  useEffect(() => {
    const unsub = controllerInputStore.onInput((state) => {
      if (deviceKey && state.deviceKey !== deviceKey) return;

      const val = state.axes[axisIndex] ?? 0;
      setRawValue(val);

      if (state.rawBytes) {
        const byteOffset = axisIndex === LEFT_TRIGGER_AXIS ? LEFT_TRIGGER_BYTE
          : axisIndex === RIGHT_TRIGGER_AXIS ? RIGHT_TRIGGER_BYTE : null;
        if (byteOffset !== null && state.rawBytes.length > byteOffset) {
          setRawByte(state.rawBytes[byteOffset]);
        }
      }

      if (stepRef.current === 'rest' && !restDoneRef.current) {
        restSamplesRef.current.push(val);
        const count = restSamplesRef.current.length;
        setRestProgress(Math.min(count / REST_SAMPLE_FRAMES, 1));

        if (count >= REST_SAMPLE_FRAMES) {
          const avg = restSamplesRef.current.reduce((a, b) => a + b, 0) / count;
          setBaseValue(avg);
          setRestDone(true);
        }
      }

      if (stepRef.current === 'max' && val > maxRef.current) {
        maxRef.current = val;
        setMaxValue(val);
      }
    });
    return unsub;
  }, [axisIndex]);

  const calibratedValue = useCallback(() => {
    const range = maxValue - baseValue;
    if (range <= 0) return 0;
    const normalized = Math.max(0, Math.min(1, (rawValue - baseValue) / range));
    if (normalized < deadzone) return 0;
    return (normalized - deadzone) / (1 - deadzone);
  }, [rawValue, baseValue, maxValue, deadzone]);

  const resetRest = useCallback(() => {
    restSamplesRef.current = [];
    setRestDone(false);
    setRestProgress(0);
  }, []);

  const advanceToMax = useCallback(() => {
    maxRef.current = baseValue;
    setMaxValue(baseValue);
    setStep('max');
  }, [baseValue]);

  return {
    step, setStep,
    rawValue, rawByte,
    restDone, restProgress, baseValue,
    maxValue,
    deadzone, setDeadzone,
    calibratedValue,
    resetRest,
    advanceToMax,
  };
};

export { useTriggerCalibration };
