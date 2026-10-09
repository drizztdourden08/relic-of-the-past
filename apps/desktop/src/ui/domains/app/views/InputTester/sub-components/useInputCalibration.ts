/* @layer renderer-components @kind hook */
import { useState, useEffect, useMemo, useRef } from 'react';
import { inputApi } from '@drizztdourden08/brock-input/renderer';
import { controllerInputStore } from '../../../../../../lib/input/controller-input-store';
import type { ControllerInputState } from '../../../../../../lib/input/controller-input-store';
import { getInputManager } from '../../../../../../lib/input/input-manager';
import type { HidControllerMap } from './HidCalibrationWizard';
import { useControllerDevices } from '../../../../../../lib/input/useControllerDevices';
import { EVENT_LOG_KEEP } from './useInputCalibration.constants';
import type { EventEntry } from './useInputCalibration.type';

const useInputCalibration = () => {
  const [events, setEvents] = useState<EventEntry[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const [controllerConnected, setControllerConnected] = useState(controllerInputStore.isConnected());
  const [controllerStates, setControllerStates] = useState<Map<string, ControllerInputState>>(new Map());
  const [controllerDiag, setControllerDiag] = useState<string[]>(controllerInputStore.getDiagLog());

  const [calibrating, setCalibrating] = useState(false);
  const [lastCalibration, setLastCalibration] = useState<HidControllerMap | null>(null);

  const { entries, isRescanPending, handleRescan } = useControllerDevices();

  const readyCount = useMemo(() => entries.filter((entry) => entry.status === 'ready').length, [entries]);

  useEffect(() => {
    const unsub = getInputManager().onInputState((hidStates) => {
      setControllerStates(hidStates);
      setControllerConnected(hidStates.size > 0 || controllerInputStore.isConnected() || readyCount > 0);
    });
    return unsub;
  }, [readyCount]);

  useEffect(() => {
    const api = inputApi();
    const unsubConnect = api?.onAdded((info) => {
      setEvents(prev => [...prev.slice(-EVENT_LOG_KEEP), { time: Date.now(), type: 'connect', id: info.name || info.deviceKey }]);
    });
    const unsubRemoved = api?.onRemoved((deviceKey) => {
      setEvents(prev => [...prev.slice(-EVENT_LOG_KEEP), { time: Date.now(), type: 'disconnect', id: deviceKey }]);
    });
    return () => {
      unsubConnect?.();
      unsubRemoved?.();
    };
  }, []);

  useEffect(() => {
    const unsubDiag = controllerInputStore.onDiag(() => {
      setControllerDiag([...controllerInputStore.getDiagLog()]);
    });
    return unsubDiag;
  }, []);

  const handleCalibrationComplete = (map: HidControllerMap) => {
    setLastCalibration(map);
    setCalibrating(false);
  };

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [events, controllerDiag]);

  return {
    events,
    logRef,
    controllerConnected,
    controllerStates,
    controllerDiag,
    calibrating,
    setCalibrating,
    lastCalibration,
    entries,
    connectedCount: readyCount,
    isRescanPending,
    handleRescan,
    handleCalibrationComplete,
  };
};

export { useInputCalibration };
export type { EventEntry };
