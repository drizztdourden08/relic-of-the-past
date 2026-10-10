/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import { inputApi } from '@drizztdourden08/brock-input/renderer';
import type { DeviceEntry, JoystickInfo } from '@drizztdourden08/brock-input';
import { EMPTY_STATUS } from './native-captures.constants';
import type { NativeCaptureStatus } from './native-captures.type';

const useNativeCaptures = (deviceEntry: DeviceEntry | null): NativeCaptureStatus => {
  const [status, setStatus] = useState<NativeCaptureStatus>(EMPTY_STATUS);

  useEffect(() => {
    const api = inputApi();
    if (!deviceEntry || !api) { setStatus(EMPTY_STATUS); return; }
    let cancelled = false;

    const run = async () => {
      const { vendorId, productId, sdlId, guid } = deviceEntry;
      const rawResult = await api.capture.startRaw(vendorId, productId);
      let mappingString: string | null = null;
      let joystickCounts: JoystickInfo | null = null;
      if (sdlId !== undefined) {
        await api.capture.startJoystick(sdlId);
        const joysticks = await api.capture.listJoysticks();
        joystickCounts = joysticks.find((j) => j.id === sdlId) ?? null;
      }
      if (guid) mappingString = await api.mapping.forGuid(guid);
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
      void api.capture.stopRaw();
      void api.capture.stopJoystick();
    };
  }, [deviceEntry]);

  return status;
};

export { useNativeCaptures };
export type { NativeCaptureStatus };
