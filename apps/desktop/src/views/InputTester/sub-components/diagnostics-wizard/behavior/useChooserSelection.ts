/* @layer renderer-components @kind hook */
import { useEffect, useMemo, useState } from 'react';
import type { ChooserDevice, UseChooserSelectionParams } from '../diagnostics-wizard.type';
import { pickDeviceKey } from './pick-device-key';

const useChooserSelection = (params: UseChooserSelectionParams) => {
  const { open, step, chooserDevices, initialDeviceKey } = params;
  const [deviceKey, setDeviceKey] = useState<string | null>(null);

  const selectedChooser: ChooserDevice | null = useMemo(
    () => chooserDevices.find((d) => d.deviceKey === deviceKey) ?? null,
    [chooserDevices, deviceKey],
  );

  useEffect(() => {
    if (!open || (step !== 'intro' && step !== 'choose-controller')) return;
    if (deviceKey && chooserDevices.some((d) => d.deviceKey === deviceKey)) return;
    setDeviceKey(pickDeviceKey(chooserDevices, initialDeviceKey));
  }, [open, step, chooserDevices, deviceKey, initialDeviceKey]);

  return { deviceKey, setDeviceKey, selectedChooser };
};

export { useChooserSelection };
