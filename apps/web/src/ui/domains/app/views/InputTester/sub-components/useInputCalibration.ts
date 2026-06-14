/* @layer renderer-components @kind hook */
/**
 * useInputCalibration — State management hook for the InputCalibration page.
 *
 * Subscribes to InputManager for gamepad/HID state, manages calibration flow,
 * HID device enumeration, and event logging.
 */

import { useState, useEffect, useRef, useCallback, useReducer } from 'react';
import { webHidReader } from '../../../../../../lib/input/hid-reader';
import type { WebHidInputState, DeviceStickCalibration } from '../../../../../../lib/input/hid-reader';
import { getInputManager } from '../../../../../../lib/input/input-manager';
import type { GamepadSnapshot } from '../../../../../../lib/input/input-manager';
import type { HidControllerMap } from './HidCalibrationWizard';
import type { TriggerCalibrationData } from './TriggerCalibrationWizard';
import type { HidDeviceInfo } from './GamepadCard';

interface EventEntry {
  time: number;
  type: 'connect' | 'disconnect';
  id: string;
}

const useInputCalibration = () => {
  const [gamepads, setGamepads] = useState<GamepadSnapshot[]>([]);
  const [events, setEvents] = useState<EventEntry[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const [webHidConnected, setWebHidConnected] = useState(webHidReader.isConnected());
  const [webHidStates, setWebHidStates] = useState<Map<string, WebHidInputState>>(new Map());
  const [webHidDiag, setWebHidDiag] = useState<string[]>(webHidReader.getDiagLog());

  const [calibrating, setCalibrating] = useState(false);
  const [lastCalibration, setLastCalibration] = useState<HidControllerMap | null>(null);

  const [stickCalibrationStore, setStickCalibrationStore] = useState<Record<string, DeviceStickCalibration>>({});

  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  const [hidDeviceInfo, setHidDeviceInfo] = useState<HidDeviceInfo[]>([]);
  const refreshHidDevices = useCallback(() => {
    window.api.enumerateHidDevices()
      .then(devices => setHidDeviceInfo(devices))
      .catch((e: unknown) => console.warn('[input] failed to enumerate HID devices', e));
  }, []);
  useEffect(() => { refreshHidDevices(); }, [webHidConnected, refreshHidDevices]);

  useEffect(() => {
    window.api.readStickCalibration()
      .then((store) => setStickCalibrationStore(store as Record<string, DeviceStickCalibration>))
      .catch((e: unknown) => console.warn('[input] failed to load stick calibration', e));
  }, []);

  // Subscribe to InputManager for all input state
  useEffect(() => {
    const inputMgr = getInputManager();
    const unsub = inputMgr.onInputState((hidStates, gamepadSnaps, _pressedKeys) => {
      setWebHidStates(hidStates);
      setWebHidConnected(hidStates.size > 0 || webHidReader.isConnected() || webHidReader.getConnectedDeviceKeys().length > 0);
      setGamepads(gamepadSnaps);
    });
    return unsub;
  }, []);

  // Direct HID connect/disconnect subscriptions for immediate UI updates
  useEffect(() => {
    const unsubConnect = window.api.onHidDeviceOpened(() => {
      forceUpdate();
      refreshHidDevices();
    });
    const unsubDisconnect = webHidReader.onDisconnect(() => {
      forceUpdate();
      refreshHidDevices();
    });
    return () => {
      unsubConnect();
      unsubDisconnect();
    };
  }, [refreshHidDevices]);

  // Gamepad connect/disconnect events (for log only)
  useEffect(() => {
    const onConnect = (e: GamepadEvent) => {
      setEvents(prev => [...prev.slice(-49), { time: Date.now(), type: 'connect', id: e.gamepad.id }]);
    };
    const onDisconnect = (e: GamepadEvent) => {
      setEvents(prev => [...prev.slice(-49), { time: Date.now(), type: 'disconnect', id: e.gamepad.id }]);
    };
    window.addEventListener('gamepadconnected', onConnect);
    window.addEventListener('gamepaddisconnected', onDisconnect);
    return () => {
      window.removeEventListener('gamepadconnected', onConnect);
      window.removeEventListener('gamepaddisconnected', onDisconnect);
    };
  }, []);

  // HID diagnostics (lightweight listener — no input polling)
  useEffect(() => {
    const unsubDiag = webHidReader.onDiag(() => {
      setWebHidDiag([...webHidReader.getDiagLog()]);
    });
    return unsubDiag;
  }, []);

  const handleCalibrationComplete = (map: HidControllerMap) => {
    setLastCalibration(map);
    setCalibrating(false);
  };

  const handleStickCalibrationComplete = async (cal: DeviceStickCalibration) => {
    const keys = webHidReader.getConnectedDeviceKeys();
    if (keys.length === 0) return;
    const key = keys[0];
    webHidReader.setStickCalibration(key, cal);
    const updated = { ...stickCalibrationStore, [key]: cal };
    setStickCalibrationStore(updated);
    await window.api.writeStickCalibration(updated);
  };

  const handleTriggerCalibrationComplete = async (deviceKey: string, axisIndex: number, cal: TriggerCalibrationData) => {
    webHidReader.setTriggerCalibration(deviceKey, axisIndex, cal);
    await window.api.writeTriggerCalibration(deviceKey, axisIndex, cal);
  };

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [events, webHidDiag]);

  return {
    gamepads,
    events,
    logRef,
    webHidConnected,
    webHidStates,
    webHidDiag,
    calibrating,
    setCalibrating,
    lastCalibration,
    stickCalibrationStore,
    hidDeviceInfo,
    handleCalibrationComplete,
    handleStickCalibrationComplete,
    handleTriggerCalibrationComplete,
  };
};

export { useInputCalibration };
export type { EventEntry };
