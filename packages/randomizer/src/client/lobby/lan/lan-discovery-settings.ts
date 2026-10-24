/* @layer bridge-wasm @kind logic */
import { BEACON_PORT, DISCOVERY_SERVICE } from '@archipelia/lobby-protocol';
import type { LanDiscoverySettings } from './lan.type';
import { SERVICE_NAME } from './lan.constants';

const lanDiscoverySettings = (): LanDiscoverySettings => {
  const match = SERVICE_NAME.exec(DISCOVERY_SERVICE);
  return {
    mdnsType: match?.[1] ?? 'archipelia',
    mdnsProtocol: match?.[2] === 'udp' ? 'udp' : 'tcp',
    beaconPort: BEACON_PORT,
  };
};

export { lanDiscoverySettings };
