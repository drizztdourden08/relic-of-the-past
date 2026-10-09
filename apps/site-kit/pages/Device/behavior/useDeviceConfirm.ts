/* @layer site-kit @kind hook */
import { useCallback, useState } from 'react';
import { confirmDevice } from '../../../api/hub-endpoints';
import { errorMessage } from '../../../api/api-error';
import type { ConfirmedDevice } from './useDeviceConfirm.type';

const useDeviceConfirm = (initialCode: string) => {
  const [code, setCode] = useState(initialCode);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<ConfirmedDevice | null>(null);

  const confirm = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const { device } = await confirmDevice(code);
      setConfirmed({ label: device.label, platform: device.platform });
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }, [code]);

  return { code, setCode, busy, error, confirmed, confirm };
};

export { useDeviceConfirm };
