/* @layer renderer-lib @kind hook */
import { useEffect, useState } from 'react';
import { requireHostApi } from '@drizztdourden08/brock-react';
import { watchLanServers } from '@rotp/randomizer';
import type { LanServer, LanSightingSource } from '@rotp/randomizer';

const hostSource = (): LanSightingSource => {
  const api = requireHostApi();
  return { start: api.startLanDiscovery, stop: api.stopLanDiscovery, onSighting: api.onLanSighting };
};

const useLanServers = (on: boolean): LanServer[] => {
  const [servers, setServers] = useState<LanServer[]>([]);

  useEffect(() => {
    if (!on) return undefined;
    return watchLanServers(hostSource(), setServers);
  }, [on]);

  return servers;
};

export { useLanServers };
