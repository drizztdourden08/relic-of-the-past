/* @layer sanctuary-site @kind hook */
/** The signed-in devices list: loaded on mount, one Revoke per row. */
import { useCallback, useEffect, useState } from 'react';
import type { Device } from '@shared/sanctuary/device-types';
import { listDevices, revokeDevice } from '../../../api/endpoints';
import { errorMessage } from '../../../api/client';

const useDevices = () => {
  const [devices, setDevices] = useState<Device[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { devices: rows } = await listDevices();
      setDevices(rows.filter((device) => device.revokedAt === null));
    } catch (cause) {
      setError(errorMessage(cause));
      setDevices([]);
    }
  }, []);

  const revoke = useCallback(async (id: string) => {
    setBusy(true);
    setError(null);
    try {
      await revokeDevice(id);
      await load();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }, [load]);

  useEffect(() => {
    void load();
  }, [load]);

  return { devices, busy, error, revoke };
};

export { useDevices };
