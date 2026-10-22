/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { useCalibrationStore } from '@drizztdourden08/brock-input/renderer';
import type { DeviceStickCalibration, TriggerCalibration } from '@drizztdourden08/brock-input';
import { controllerInputStore } from '../../../input/controller-input-store';

const useStickTriggerCalibrations = (readyDeviceKeys: readonly string[]) => {
  const stickCalibrationStore = useCalibrationStore((s) => s.sticks);
  const saveStick = useCalibrationStore((s) => s.saveStick);
  const saveTrigger = useCalibrationStore((s) => s.saveTrigger);

  const handleStickCalibrationComplete = useCallback(async (cal: DeviceStickCalibration) => {
    const key = readyDeviceKeys[0];
    if (key === undefined) return;
    controllerInputStore.log(`Stick calibration loaded for ${key}`);
    await saveStick(key, cal);
  }, [readyDeviceKeys, saveStick]);

  const handleTriggerCalibrationComplete = useCallback(async (deviceKey: string, axisIndex: number, cal: TriggerCalibration) => {
    controllerInputStore.log(`Trigger calibration loaded for ${deviceKey} axis ${axisIndex}`);
    await saveTrigger(deviceKey, axisIndex, cal);
  }, [saveTrigger]);

  return { stickCalibrationStore, handleStickCalibrationComplete, handleTriggerCalibrationComplete };
};

export { useStickTriggerCalibrations };
