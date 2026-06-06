/**
 * useInputTester — State and subscriptions for the InputTester view.
 */

import { useState, useEffect, useRef } from 'react';
import { webHidReader } from '../../../lib/input/hid-reader';
import type { WebHidInputState } from '../../../lib/input/hid-reader';
import { getInputManager } from '../../../lib/input/input-manager';
import type { GamepadSnapshot } from '../../../lib/input/input-manager';
import type { HidControllerMap } from './sub-components/HidCalibrationWizard';

interface EventEntry {
  time: number;
  type: 'connect' | 'disconnect';
  index: number;
  id: string;
}

interface HidDevice {
  vendorId: string;
  productId: string;
  product: string;
  manufacturer: string;
  path: string;
  serialNumber: string | null;
}

const useInputTester = () => {
  const [gamepads, setGamepads] = useState<GamepadSnapshot[]>([]);
  const [events, setEvents] = useState<EventEntry[]>([]);
  const [hidDevices, setHidDevices] = useState<HidDevice[]>([]);
  const eventLogRef = useRef<HTMLDivElement>(null);

  const [webHidConnected, setWebHidConnected] = useState(webHidReader.isConnected());
  const [webHidStates, setWebHidStates] = useState<Map<string, WebHidInputState>>(new Map());
  const [webHidDiag, setWebHidDiag] = useState<string[]>(webHidReader.getDiagLog());

  const [calibrating, setCalibrating] = useState(false);
  const [lastCalibration, setLastCalibration] = useState<HidControllerMap | null>(null);

  // Subscribe to InputManager for all input state
  useEffect(() => {
    const inputMgr = getInputManager();
    const unsub = inputMgr.onInputState((hidStates, gamepadSnaps, _pressedKeys) => {
      setWebHidStates(hidStates);
      setWebHidConnected(hidStates.size > 0 || webHidReader.isConnected());
      setGamepads(gamepadSnaps);
    });
    return unsub;
  }, []);

  // Gamepad connect/disconnect events (for log only)
  useEffect(() => {
    const onConnect = (e: GamepadEvent) => {
      setEvents(prev => [...prev.slice(-49), {
        time: Date.now(),
        type: 'connect',
        index: e.gamepad.index,
        id: e.gamepad.id,
      }]);
    };
    const onDisconnect = (e: GamepadEvent) => {
      setEvents(prev => [...prev.slice(-49), {
        time: Date.now(),
        type: 'disconnect',
        index: e.gamepad.index,
        id: e.gamepad.id,
      }]);
    };
    window.addEventListener('gamepadconnected', onConnect);
    window.addEventListener('gamepaddisconnected', onDisconnect);
    return () => {
      window.removeEventListener('gamepadconnected', onConnect);
      window.removeEventListener('gamepaddisconnected', onDisconnect);
    };
  }, []);

  // Auto-scroll event log
  useEffect(() => {
    if (eventLogRef.current) {
      eventLogRef.current.scrollTop = eventLogRef.current.scrollHeight;
    }
  }, [events]);

  // Enumerate HID devices on mount
  useEffect(() => {
    window.api.enumerateHidDevices().then(setHidDevices).catch(() => {});
  }, []);

  // HID diagnostics
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

  return {
    gamepads,
    events,
    hidDevices,
    eventLogRef,
    webHidConnected,
    webHidStates,
    webHidDiag,
    calibrating,
    setCalibrating,
    lastCalibration,
    handleCalibrationComplete,
  };
};

export type { EventEntry, HidDevice };
export { useInputTester };
