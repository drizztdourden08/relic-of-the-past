/* @layer renderer-components @kind hook */
import { useState, useEffect, useRef, useCallback } from 'react';
import { controllerInputStore } from '@app/input/controller-input-store';
import { REST_SAMPLE_FRAMES } from '../trigger-calibration.constants';
import { triggerByteOf } from '../trigger-byte-of';
import type { Step, UseTriggerReadingsOptions } from '../trigger-calibration.type';

const useTriggerReadings = ({ axisIndex, deviceKey, step, existingCalibration }: UseTriggerReadingsOptions) => {
  const [rawValue, setRawValue] = useState(0);
  const [rawByte, setRawByte] = useState<number | null>(null);
  const restSamplesRef = useRef<number[]>([]);
  const [restDone, setRestDone] = useState(false);
  const [restProgress, setRestProgress] = useState(0);
  const [baseValue, setBaseValue] = useState(existingCalibration?.base ?? 0);
  const [maxValue, setMaxValue] = useState(existingCalibration?.max ?? 0);
  const maxRef = useRef(0);
  const stepRef = useRef<Step>(step);
  stepRef.current = step;
  const restDoneRef = useRef(restDone);
  restDoneRef.current = restDone;

  const sampleRest = useCallback((val: number) => {
    restSamplesRef.current.push(val);
    const count = restSamplesRef.current.length;
    setRestProgress(Math.min(count / REST_SAMPLE_FRAMES, 1));
    if (count < REST_SAMPLE_FRAMES) return;
    setBaseValue(restSamplesRef.current.reduce((a, b) => a + b, 0) / count);
    setRestDone(true);
  }, []);

  useEffect(() => controllerInputStore.onInput((state) => {
    if (deviceKey && state.deviceKey !== deviceKey) return;
    const val = state.axes[axisIndex] ?? 0;
    setRawValue(val);
    const byte = triggerByteOf(state.rawBytes, axisIndex);
    if (byte !== null) setRawByte(byte);
    if (stepRef.current === 'rest' && !restDoneRef.current) sampleRest(val);
    if (stepRef.current === 'max' && val > maxRef.current) {
      maxRef.current = val;
      setMaxValue(val);
    }
  }), [axisIndex, deviceKey, sampleRest]);

  const resetRest = useCallback(() => {
    restSamplesRef.current = [];
    setRestDone(false);
    setRestProgress(0);
  }, []);

  const startMax = useCallback(() => {
    maxRef.current = baseValue;
    setMaxValue(baseValue);
  }, [baseValue]);

  return { rawValue, rawByte, restDone, restProgress, baseValue, maxValue, resetRest, startMax };
};

export { useTriggerReadings };
