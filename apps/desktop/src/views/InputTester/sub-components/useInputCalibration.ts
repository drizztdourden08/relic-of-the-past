/* @layer renderer-components @kind hook */
import { useState, useEffect, useMemo, useRef } from 'react';
import { controllerInputStore } from '../../../input/controller-input-store';
import type { ControllerInputState } from '../../../input/controller-input-store';
import { getInputManager } from '@app/input/input-manager/get-input-manager';
import type { HidControllerMap } from './HidCalibrationWizard';
import { useControllerDevices } from '../../../hooks/useControllerDevices';
import { useControllerEventLog } from './useControllerEventLog';
import { useStickTriggerCalibrations } from './useStickTriggerCalibrations';

const useInputCalibration = () => {
  const events = useControllerEventLog();
  const logRef = useRef<HTMLDivElement>(null);

  const [controllerConnected, setControllerConnected] = useState(controllerInputStore.isConnected());
  const [controllerStates, setControllerStates] = useState<Map<string, ControllerInputState>>(new Map());
  const [controllerDiag, setControllerDiag] = useState<string[]>(controllerInputStore.getDiagLog());

  const [calibrating, setCalibrating] = useState(false);
  const [lastCalibration, setLastCalibration] = useState<HidControllerMap | null>(null);

  const { entries, groups: controllerGroups, isRescanPending, handleRescan, addMapping } = useControllerDevices();

  const readyDeviceKeys = useMemo(
    () => entries.filter((entry) => entry.status === 'ready').map((entry) => entry.deviceKey),
    [entries],
  );
  const calibrations = useStickTriggerCalibrations(readyDeviceKeys);

  useEffect(() => getInputManager().onInputState((hidStates) => {
    setControllerStates(hidStates);
    setControllerConnected(hidStates.size > 0 || controllerInputStore.isConnected() || readyDeviceKeys.length > 0);
  }), [readyDeviceKeys]);

  useEffect(() => controllerInputStore.onDiag(() => {
    setControllerDiag([...controllerInputStore.getDiagLog()]);
  }), []);

  const handleCalibrationComplete = (map: HidControllerMap) => {
    setLastCalibration(map);
    setCalibrating(false);
  };

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [events, controllerDiag]);

  return {
    events, logRef, controllerConnected, controllerStates, controllerDiag,
    calibrating, setCalibrating, lastCalibration,
    controllerGroups, connectedCount: readyDeviceKeys.length,
    isRescanPending, handleRescan, addMapping, handleCalibrationComplete,
    ...calibrations,
  };
};

export { useInputCalibration };
