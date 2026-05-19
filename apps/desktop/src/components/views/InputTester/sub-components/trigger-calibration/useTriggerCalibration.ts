/**
 * useTriggerCalibration — state management hook for 2-step analog trigger calibration.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { webHidReader } from '../../../../../lib/input/hid-reader';

// ── Types ──

interface TriggerCalibrationData {
  base: number;
  max: number;
  deadzone: number;
}

type Step = 'rest' | 'max' | 'review';

interface UseTriggerCalibrationOptions {
  axisIndex: number;
  deviceKey?: string;
  existingCalibration?: TriggerCalibrationData | null;
}

// ── Constants ──

const REST_SAMPLE_FRAMES = 60;
const DEFAULT_DEADZONE = 0.05;

// ── Hook ──

function useTriggerCalibration(options: UseTriggerCalibrationOptions) {
  const { axisIndex, deviceKey, existingCalibration } = options;

  const [step, setStep] = useState<Step>('rest');
  const [rawValue, setRawValue] = useState(0);
  const [rawByte, setRawByte] = useState<number | null>(null);

  // Rest sampling
  const restSamplesRef = useRef<number[]>([]);
  const [restDone, setRestDone] = useState(false);
  const [restProgress, setRestProgress] = useState(0);
  const [baseValue, setBaseValue] = useState(existingCalibration?.base ?? 0);

  // Max tracking
  const [maxValue, setMaxValue] = useState(existingCalibration?.max ?? 0);
  const maxRef = useRef(0);

  // Review
  const [deadzone, setDeadzone] = useState(existingCalibration?.deadzone ?? DEFAULT_DEADZONE);

  // Refs for step/restDone so the subscription callback always sees current values
  const stepRef = useRef<Step>(step);
  stepRef.current = step;
  const restDoneRef = useRef(restDone);
  restDoneRef.current = restDone;

  useEffect(() => {
    const unsub = webHidReader.onInput((state) => {
      if (deviceKey && state.deviceKey !== deviceKey) return;

      const val = state.axes[axisIndex] ?? 0;
      setRawValue(val);

      if (state.rawBytes) {
        const byteOffset = axisIndex === 4 ? 61 : axisIndex === 5 ? 62 : null;
        if (byteOffset !== null && state.rawBytes.length > byteOffset) {
          setRawByte(state.rawBytes[byteOffset]);
        }
      }

      // Rest sampling
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

      // Max tracking
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

  const resetRest = () => {
    restSamplesRef.current = [];
    setRestDone(false);
    setRestProgress(0);
  };

  const advanceToMax = () => {
    maxRef.current = baseValue;
    setMaxValue(baseValue);
    setStep('max');
  };

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
}

export { useTriggerCalibration, DEFAULT_DEADZONE };
export type { TriggerCalibrationData, Step };
