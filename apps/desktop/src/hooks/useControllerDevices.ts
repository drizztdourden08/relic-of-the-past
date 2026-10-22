/* @layer renderer-lib @kind hook */
import { useCallback, useEffect, useMemo } from 'react';
import { useControllerDevicesStore } from '@drizztdourden08/brock-input/renderer';
import { groupControllerDevices } from '@rotp/input-mapping';

const useControllerDevices = () => {
  const { entries, loaded, rescanPending, refresh, rescan, addMapping } = useControllerDevicesStore();

  useEffect(() => {
    if (!loaded) void refresh();
  }, [loaded, refresh]);

  const handleRescan = useCallback(() => { void rescan(); }, [rescan]);

  const groups = useMemo(() => groupControllerDevices(entries), [entries]);

  return { entries, groups, isRescanPending: rescanPending, handleRescan, addMapping };
};

export { useControllerDevices };
