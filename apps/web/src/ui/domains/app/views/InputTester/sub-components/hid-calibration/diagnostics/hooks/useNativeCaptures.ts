/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import * as nativeCapture from '@app/lib/input/native-capture-store';
import type { DeviceEntry, JoystickInfo } from '@shared/ipc';
import { EMPTY_STATUS } from './useNativeCaptures.constants';
import type { NativeCaptureStatus } from './useNativeCaptures.type';

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
