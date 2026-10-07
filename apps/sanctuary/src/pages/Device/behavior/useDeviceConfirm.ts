/* @layer sanctuary-site @kind hook */
/** The device page's one call: confirm a user code, keep the label the API answers with. */
import { useCallback, useState } from 'react';
import { confirmDevice } from '../../../api/endpoints';
import { errorMessage } from '../../../api/client';

type ConfirmedDevice = { label: string; platform: string };

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
export type { ConfirmedDevice };
