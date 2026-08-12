/* @layer renderer-components @kind hook */
/**
 * Owns the lifecycle of the two SDL3 diagnostic captures for the wizard's
 * device: a raw HID byte capture (vendorId/productId, best-effort, since SDL's
 * own joystick handle can hold the device exclusively) and a joystick-level
 * capture (needs an SDL joystick id, so only runs once the device is
 * SDL-claimed). Starts both on mount, stops both on unmount.
 */
import { useEffect, useState } from 'react';
import * as nativeCapture from '@app/lib/input/native-capture-store';
import type { DeviceEntry, JoystickInfo } from '@shared/ipc';

interface NativeCaptureStatus {
  rawAvailable: boolean;
  rawUnavailableReason: string | null;
  mappingString: string | null;
  joystickCounts: JoystickInfo | null;
}

const EMPTY_STATUS: NativeCaptureStatus = {
  rawAvailable: false, rawUnavailableReason: 'not-found', mappingString: null, joystickCounts: null,
};

const useNativeCaptures = (deviceEntry: DeviceEntry | null): NativeCaptureStatus => {
  const [status, setStatus] = useState<NativeCaptureStatus>(EMPTY_STATUS);

  useEffect(() => {
    if (!deviceEntry) { setStatus(EMPTY_STATUS); return; }
    let cancelled = false;

    const run = async () => {
      const { vendorId, productId, sdlId, guid } = deviceEntry;
      const rawResult = await nativeCapture.startRawCapture(vendorId, productId);
      let mappingString: string | null = null;
      let joystickCounts: JoystickInfo | null = null;
      if (sdlId !== undefined) {
        await nativeCapture.startJoystickCapture(sdlId);
        const joysticks = await nativeCapture.listJoysticks();
        joystickCounts = joysticks.find((j) => j.id === sdlId) ?? null;
      }
      if (guid) mappingString = await nativeCapture.mappingForGuid(guid);
      if (cancelled) return;
      setStatus({
        rawAvailable: rawResult.ok,
        rawUnavailableReason: rawResult.ok ? null : (rawResult.reason ?? 'error'),
        mappingString,
        joystickCounts,
      });
    };
    run().catch(() => { if (!cancelled) setStatus(EMPTY_STATUS); });

    return () => {
      cancelled = true;
      nativeCapture.stopRawCapture();
      nativeCapture.stopJoystickCapture();
    };
  }, [deviceEntry]);

  return status;
};

export { useNativeCaptures };
export type { NativeCaptureStatus };
