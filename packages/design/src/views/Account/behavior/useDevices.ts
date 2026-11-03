/* @layer site-kit @kind hook */
import { useCallback, useEffect, useState } from 'react';
import type { Device } from '@rotp/hub-contracts';
import { listDevices, revokeDevice, errorMessage } from '@rotp/hub-client';
import { useNoticeRun } from '../../../hooks/useNoticeRun/useNoticeRun';

const useDevices = () => {
  const [devices, setDevices] = useState<Device[] | null>(null);
  const { busy, notice: error, setNotice: setError, run } = useNoticeRun();

  const load = useCallback(async () => {
    try {
      const { devices: rows } = await listDevices();
      setDevices(rows.filter((device) => device.revokedAt === null));
    } catch (cause) {
      setError(errorMessage(cause));
      setDevices([]);
    }
  }, [setError]);

  const revoke = useCallback(async (id: string) => {
    await run(async () => {
      await revokeDevice(id);
      return null;
    });
    await load();
  }, [run, load]);

  useEffect(() => {
    void load();
  }, [load]);

  return { devices, busy, error, revoke };
};

export { useDevices };
