/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import { useControllerDevices } from '@app/hooks/useControllerDevices';
import { DIRECTORY_HINT } from '../ControllerDirectory.constants';
import { directoryFacts } from './directory-facts';
import { useMappingEntries } from './useMappingEntries';

const useDirectoryHero = () => {
  const { entries: devices, isRescanPending, handleRescan } = useControllerDevices();
  const connected = useMemo(() => devices.filter((device) => device.status === 'ready'), [devices]);
  const mapping = useMappingEntries(connected);
  const facts = useMemo(() => directoryFacts({ connected: connected.length, mapping }), [connected, mapping]);

  return { facts, hint: DIRECTORY_HINT, isRescanPending, onRescan: handleRescan };
};

export { useDirectoryHero };
