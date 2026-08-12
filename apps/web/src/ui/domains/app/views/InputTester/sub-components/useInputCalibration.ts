/* @layer renderer-components @kind hook */
/**
 * useInputCalibration — State management hook for the InputCalibration page.
 *
 * Subscribes to InputManager for HID state, manages calibration flow, and
 * event logging. Every controller is SDL3-claimed now (the browser Gamepad
 * API path has been removed), so connect/disconnect events for the log come
 * from the same SDL3 channels as everything else.
 */

import { useState, useEffect, useMemo, useRef, useReducer } from 'react';
import { controllerInputStore } from '../../../../../../lib/input/controller-input-store';
import type { ControllerInputState, DeviceStickCalibration } from '../../../../../../lib/input/controller-input-store';
import { getInputManager } from '../../../../../../lib/input/input-manager';
import type { HidControllerMap } from './HidCalibrationWizard';
import type { TriggerCalibrationData } from './TriggerCalibrationWizard';
import * as controllersStore from '@app/lib/input/controllers-store';
import { useControllerDevices } from '../../../../../../lib/input/useControllerDevices';

interface EventEntry {
  time: number;
  type: 'connect' | 'disconnect';
  id: string;
}

const useInputCalibration = () => {
  const [events, setEvents] = useState<EventEntry[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const [controllerConnected, setControllerConnected] = useState(controllerInputStore.isConnected());
  const [controllerStates, setControllerStates] = useState<Map<string, ControllerInputState>>(new Map());
  const [controllerDiag, setControllerDiag] = useState<string[]>(controllerInputStore.getDiagLog());

  const [calibrating, setCalibrating] = useState(false);
  const [lastCalibration, setLastCalibration] = useState<HidControllerMap | null>(null);

  const [stickCalibrationStore, setStickCalibrationStore] = useState<Record<string, DeviceStickCalibration>>({});

  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  const { entries, groups: controllerGroups, isRescanPending, handleRescan, addMapping } = useControllerDevices();

  // The definitive "is a controller connected" answer: the same SDL3 snapshot
  // the cards render from, status 'ready'. controllerInputStore's own tally only
  // counts devices that have sent at least one input report, so an untouched
  // pad already visible as a card would read as disconnected there.
  const readyDeviceKeys = useMemo(
    () => entries.filter((entry) => entry.status === 'ready').map((entry) => entry.deviceKey),
    [entries],
  );

  useEffect(() => {
    controllersStore.readStickCalibration()
      .then((store) => setStickCalibrationStore(store as Record<string, DeviceStickCalibration>))
      .catch((e: unknown) => console.warn('[input] failed to load stick calibration', e));
  }, []);

  // Subscribe to InputManager for all input state
  useEffect(() => {
    const inputMgr = getInputManager();
    const unsub = inputMgr.onInputState((hidStates, _pressedKeys) => {
      setControllerStates(hidStates);
      setControllerConnected(hidStates.size > 0 || controllerInputStore.isConnected() || readyDeviceKeys.length > 0);
    });
    return unsub;
  }, [readyDeviceKeys]);

  // Direct connect/disconnect subscriptions for immediate UI updates and the event log.
  useEffect(() => {
    const unsubConnect = window.api.onControllerAdded((info) => {
      forceUpdate();
      setEvents(prev => [...prev.slice(-49), { time: Date.now(), type: 'connect', id: info.name || info.deviceKey }]);
    });
    const unsubRemoved = window.api.onControllerRemoved((deviceKey) => {
      setEvents(prev => [...prev.slice(-49), { time: Date.now(), type: 'disconnect', id: deviceKey }]);
    });
    const unsubDisconnect = controllerInputStore.onDisconnect(() => {
      forceUpdate();
    });
    return () => {
      unsubConnect();
      unsubRemoved();
      unsubDisconnect();
    };
  }, []);

  // HID diagnostics (lightweight listener — no input polling)
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

  const handleStickCalibrationComplete = async (cal: DeviceStickCalibration) => {
    if (readyDeviceKeys.length === 0) return;
    const key = readyDeviceKeys[0];
    controllerInputStore.setStickCalibration(key, cal);
    const updated = { ...stickCalibrationStore, [key]: cal };
    setStickCalibrationStore(updated);
    await controllersStore.writeStickCalibration(updated);
  };

  const handleTriggerCalibrationComplete = async (deviceKey: string, axisIndex: number, cal: TriggerCalibrationData) => {
    controllerInputStore.setTriggerCalibration(deviceKey, axisIndex, cal);
    await controllersStore.writeTriggerCalibration(deviceKey, axisIndex, cal);
  };

  // Auto-scroll log
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
    stickCalibrationStore,
    controllerGroups,
    connectedCount: readyDeviceKeys.length,
    isRescanPending,
    handleRescan,
    addMapping,
    handleCalibrationComplete,
    handleStickCalibrationComplete,
    handleTriggerCalibrationComplete,
  };
};

export { useInputCalibration };
export type { EventEntry };
