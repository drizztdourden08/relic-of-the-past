/* @layer shared-types @kind types */
import type { LanDiscoverySettings } from '@drizztdourden08/brock-randomizer/archipelago';

type FirewallStatus = 'allowed' | 'blocked' | 'unknown';

interface LanInvokeContract {
  'lan:discovery:start': (settings: LanDiscoverySettings) => Promise<void>;
  'lan:discovery:stop': () => Promise<void>;
  'lan:firewall:status': () => Promise<FirewallStatus>;
  'lan:firewall:allow': () => Promise<FirewallStatus>;
}

export type { FirewallStatus, LanInvokeContract };
