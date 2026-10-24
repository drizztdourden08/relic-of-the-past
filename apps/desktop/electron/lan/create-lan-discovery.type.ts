/* @layer electron-main @kind types */
import type { LanDiscoverySettings } from '@rotp/randomizer';

type LanDiscovery = {
  start: (settings: LanDiscoverySettings) => void;
  stop: () => void;
};

export type { LanDiscovery };
