/* @layer renderer-components @kind logic */
import { onlineConfigOfProfile } from '@app/game/randomizer-client';
import { offlineChip } from './offline-chip';
import type { NetworkStatus } from '@app/game/randomizer-client';
import type { ProfileRandomizerConfig } from '@app/profiles/types';
import type { NetworkView } from './network-view.type';

const isThisConnection = (last: NetworkStatus, config: ProfileRandomizerConfig): boolean => {
  const { url, slotName } = onlineConfigOfProfile(config);
  return last.connection.configuredUrl === url && last.connection.slotName === slotName;
};

const networkViewOf = (
  status: NetworkStatus | null, last: NetworkStatus | null, config: ProfileRandomizerConfig | null,
): NetworkView => {
  if (status !== null) return { status, live: true, offline: offlineChip(false) };
  const kept = last !== null && config !== null && isThisConnection(last, config) ? last : null;
  return { status: kept, live: false, offline: offlineChip(kept !== null) };
};

export { networkViewOf };
export type { NetworkView };
