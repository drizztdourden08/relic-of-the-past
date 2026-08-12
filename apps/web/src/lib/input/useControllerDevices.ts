/* @layer renderer-lib @kind hook */
/**
 * Shared controller device-list state for both input-diagnostic screens:
 * fetches the SDL3 snapshot, regroups it by adapter, and tracks a rescan's
 * pending state until the next snapshot arrives (or a timeout elapses) so a
 * rescan click never looks like it did nothing.
 *
 * No loading flag: the main process now serves `controller:list` from a
 * cache it keeps current on connect/disconnect/rescan (see sdl3-source.ts),
 * so the initial fetch resolves in well under a millisecond — a spinner for
 * it would only ever flash for a single frame.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DeviceEntry } from '@shared/ipc';
import { groupControllerDevices } from './controller-device-groups';
import { addControllerMapping, listControllerDevices, onControllerDevicesSnapshot, rescanControllerDevices } from './controller-devices-store';

/** Longest a rescan spinner spins before giving up on hearing back — a
 *  teardown+repopulate cycle should land well inside this. */
const RESCAN_TIMEOUT_MS = 3000;

const useControllerDevices = () => {
  const [entries, setEntries] = useState<DeviceEntry[]>([]);
  const [isRescanPending, setIsRescanPending] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    listControllerDevices()
      .then((snapshot) => { if (isMountedRef.current) setEntries(snapshot); })
      .catch(() => {});
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
