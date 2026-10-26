/* @layer shared-types @kind types */
import type { LanDiscoverySettings } from '@rotp/randomizer';

interface LanInvokeContract {
  'lan:discovery:start': (settings: LanDiscoverySettings) => Promise<void>;
  'lan:discovery:stop': () => Promise<void>;
}

export type { LanInvokeContract };
