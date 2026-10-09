/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import { listInputDevices } from './list-input-devices';
import { useNativeCaptures } from '../diagnostics/hooks/useNativeCaptures';
import type { NativeCaptureStatus } from '../diagnostics/hooks/useNativeCaptures';
import type { Phase } from '../hid-calibration.type';

const useWizardRawCapture = (phase: Phase, deviceKey?: string): NativeCaptureStatus => {
  const [deviceEntry, setDeviceEntry] = useState<DeviceEntry | null>(null);

  useEffect(() => {
    if (phase !== 'live') { setDeviceEntry(null); return; }
    let cancelled = false;
    listInputDevices().then((devices) => {
      if (cancelled) return;
      const entry = deviceKey
        ? devices.find((d) => d.deviceKey === deviceKey) ?? null
        : devices.find((d) => d.status === 'ready') ?? null;
      setDeviceEntry(entry);
    }).catch(() => { if (!cancelled) setDeviceEntry(null); });
    return () => { cancelled = true; };
  }, [phase, deviceKey]);

  return useNativeCaptures(deviceEntry);
};

export { useWizardRawCapture };
