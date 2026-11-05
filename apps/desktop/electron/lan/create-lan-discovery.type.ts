/* @layer electron-main @kind types */
import type { LanDiscoverySettings } from '@drizztdourden08/brock-randomizer/archipelago';

type LanDiscovery = {
  start: (settings: LanDiscoverySettings) => void;
  stop: () => void;
};

export type { LanDiscovery };
