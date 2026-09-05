/* @layer renderer-components @kind hook */
/**
 * Resolves the SDL device entry for the wizard's calibration target and
 * hands it to useNativeCaptures, which starts the raw HID + joystick
 * captures while live and stops them on close, since that hook already owns the
 * start/stop lifecycle, this just supplies which device to open it on.
 */
import { useEffect, useState } from 'react';
import { listControllerDevices } from '@app/lib/input/controller-devices-store';
import type { DeviceEntry } from '@shared/ipc';
import { useNativeCaptures } from '../diagnostics/hooks/useNativeCaptures';
import type { NativeCaptureStatus } from '../diagnostics/hooks/useNativeCaptures';
import type { Phase } from '../hid-calibration.type';

const useWizardRawCapture = (phase: Phase, deviceKey?: string): NativeCaptureStatus => {
  const [deviceEntry, setDeviceEntry] = useState<DeviceEntry | null>(null);

  useEffect(() => {
    if (phase !== 'live') { setDeviceEntry(null); return; }
    let cancelled = false;
    listControllerDevices().then((devices) => {
      if (cancelled) return;
      // Falls back to the first ready device in the live snapshot, not one
      // that has already reported input, so an untouched pad is still pickable.
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
