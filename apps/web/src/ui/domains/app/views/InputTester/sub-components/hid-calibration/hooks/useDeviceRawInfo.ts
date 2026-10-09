/* @layer renderer-components @kind hook */
import { useEffect, useRef } from 'react';
import type React from 'react';
import { listControllerDevices } from '@app/lib/input/controller-devices-store';
import { EMPTY_RAW_INFO } from './useDeviceRawInfo.constants';
import type { RawHidInfo } from './useDeviceRawInfo.type';

const useDeviceRawInfo = (deviceKey?: string): React.MutableRefObject<RawHidInfo> => {
  const rawInfoRef = useRef<RawHidInfo>(EMPTY_RAW_INFO);

  useEffect(() => {
    listControllerDevices().then((devices) => {
      const match = deviceKey
        ? devices.find((d) => d.deviceKey === deviceKey)
        : devices.find((d) => d.status === 'ready');
      if (match) {
        rawInfoRef.current = {
          path: null, manufacturer: null, product: match.product || null, serialNumber: null,
          busType: match.busType,
        };
      }
    }).catch(() => undefined);
  }, [deviceKey]);

  return rawInfoRef;
};

export { useDeviceRawInfo };
export type { RawHidInfo };
