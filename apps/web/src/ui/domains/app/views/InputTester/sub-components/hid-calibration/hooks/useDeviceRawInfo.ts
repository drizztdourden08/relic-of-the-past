/* @layer renderer-components @kind hook */
/** Fetches SDL-reported device metadata for the active device once. busType
 *  is the ground truth for USB vs Bluetooth (see connection-hint.ts), and this
 *  feeds buildCalibrationMap. node-hid is gone, so path/manufacturer/serial
 *  have no source anymore and stay null; product still comes through. */
import { useEffect, useRef } from 'react';
import { listControllerDevices } from '@app/lib/input/controller-devices-store';
import type { ControllerBusType } from '@shared/ipc';

interface RawHidInfo {
  path: string | null;
  manufacturer: string | null;
  product: string | null;
  serialNumber: string | null;
  busType: ControllerBusType | null;
}

const EMPTY_RAW_INFO: RawHidInfo = { path: null, manufacturer: null, product: null, serialNumber: null, busType: null };

const useDeviceRawInfo = (deviceKey?: string): React.MutableRefObject<RawHidInfo> => {
  const rawInfoRef = useRef<RawHidInfo>(EMPTY_RAW_INFO);

  useEffect(() => {
    listControllerDevices().then((devices) => {
      // Falls back to the first ready device in the live snapshot, not one
      // that has already reported input, so an untouched pad is still pickable.
      const match = deviceKey
        ? devices.find((d) => d.deviceKey === deviceKey)
        : devices.find((d) => d.status === 'ready');
      if (match) {
        rawInfoRef.current = {
          path: null, manufacturer: null, product: match.product || null, serialNumber: null,
          busType: match.busType,
        };
      }
    }).catch(() => { /* best-effort, buildCalibrationMap treats missing info as unknown */ });
  }, [deviceKey]);

  return rawInfoRef;
};

export { useDeviceRawInfo };
export type { RawHidInfo };
