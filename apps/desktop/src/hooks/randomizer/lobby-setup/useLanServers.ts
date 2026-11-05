/* @layer renderer-lib @kind hook */
import { useEffect, useState } from 'react';
import { requireHostApi } from '@drizztdourden08/brock-react';
import { watchLanServers } from '@drizztdourden08/brock-randomizer/archipelago';
import type { LanServer, LanSightingSource } from '@drizztdourden08/brock-randomizer/archipelago';

const hostSource = (): LanSightingSource => {
  const api = requireHostApi();
  return { start: api.startLanDiscovery, stop: api.stopLanDiscovery, onSighting: api.onLanSighting };
};

const useLanServers = (on: boolean, refresh = 0): LanServer[] => {
  const [servers, setServers] = useState<LanServer[]>([]);

  useEffect(() => {
    if (!on) return undefined;
    setServers([]);
    return watchLanServers(hostSource(), setServers);
  }, [on, refresh]);

  return servers;
};

export { useLanServers };
