/* @layer renderer-components @kind types */
import type { NetworkStatus } from '@app/game/randomizer-client';
import type { Chip } from './network-tone';

interface NetworkView {
  status: NetworkStatus | null;
  live: boolean;
  offline: Chip;
}

export type { NetworkView };
