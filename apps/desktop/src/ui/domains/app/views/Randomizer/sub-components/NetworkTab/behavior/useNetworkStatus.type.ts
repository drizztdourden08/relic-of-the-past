/* @layer renderer-components @kind types */
import type { NetworkStatus } from '@app/lib/game/randomizer-client';

interface NetworkStatusView {
  status: NetworkStatus | null;
  last: NetworkStatus | null;
  now: number;
}

export type { NetworkStatusView };
