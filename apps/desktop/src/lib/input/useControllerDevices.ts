/* @layer renderer-lib @kind hook */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DeviceEntry } from '@shared/ipc';
import { groupControllerDevices } from './controller-device-groups';
import { addControllerMapping, listControllerDevices, onControllerDevicesSnapshot, rescanControllerDevices } from './controller-devices-store';
import { RESCAN_TIMEOUT_MS } from './useControllerDevices.constants';

const useControllerDevices = () => {
  const [entries, setEntries] = useState<DeviceEntry[]>([]);
  const [isRescanPending, setIsRescanPending] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    listControllerDevices()
      .then((snapshot) => { if (isMountedRef.current) setEntries(snapshot); })
      .catch(() => undefined);
    const unsubscribe = onControllerDevicesSnapshot((snapshot) => {
      if (!isMountedRef.current) return;
      setEntries(snapshot);
      setIsRescanPending(false);
    });
    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isRescanPending) return;
    const timer = setTimeout(() => setIsRescanPending(false), RESCAN_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isRescanPending]);

  const handleRescan = useCallback(() => {
    setIsRescanPending(true);
    rescanControllerDevices().catch(() => setIsRescanPending(false));
  }, []);

  const groups = useMemo(() => groupControllerDevices(entries), [entries]);

  return { entries, groups, isRescanPending, handleRescan, addMapping: addControllerMapping };
};

export { useControllerDevices };
