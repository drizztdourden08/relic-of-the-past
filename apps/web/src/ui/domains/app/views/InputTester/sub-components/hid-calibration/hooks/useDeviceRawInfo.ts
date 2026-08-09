/* @layer renderer-components @kind hook */
/** Fetches raw OS-level HID metadata (path, manufacturer, product, serial) for the
 *  active device once — this is the ground truth for USB vs Bluetooth, unlike the
 *  guessConnectionHint() heuristic that reads it, and feeds buildCalibrationMap. */
import { useEffect, useRef } from 'react';
import { webHidReader } from '../../../../../../../../lib/input/hid-reader';

interface RawHidInfo {
  path: string | null;
  manufacturer: string | null;
  product: string | null;
  serialNumber: string | null;
}

const EMPTY_RAW_INFO: RawHidInfo = { path: null, manufacturer: null, product: null, serialNumber: null };

const useDeviceRawInfo = (deviceKey?: string): React.MutableRefObject<RawHidInfo> => {
  const rawInfoRef = useRef<RawHidInfo>(EMPTY_RAW_INFO);

  useEffect(() => {
    window.api.enumerateHidDevices().then((devices) => {
      const key = deviceKey ?? webHidReader.getConnectedDeviceKeys()[0];
      if (!key) return;
      const [vid, pid] = key.split(':');
      const match = devices.find((d) => d.vendorId.toLowerCase() === vid?.toLowerCase() && d.productId.toLowerCase() === pid?.toLowerCase());
      if (match) {
        rawInfoRef.current = {
          path: match.path || null,
          manufacturer: match.manufacturer || null,
          product: match.product || null,
          serialNumber: match.serialNumber,
        };
      }
    }).catch(() => { /* best-effort — buildCalibrationMap treats missing info as unknown */ });
  }, [deviceKey]);

  return rawInfoRef;
};

export { useDeviceRawInfo };
export type { RawHidInfo };
