/* @layer renderer-components @kind logic */
/**
 * What the Network tab's panels draw: the live session's picture while one runs; with the
 * game stopped, the last session's picture when it was on this profile's connection, marked
 * as not live; otherwise nothing, and every panel says it is not connected.
 */
import { onlineConfigOfProfile } from '@app/lib/game/randomizer-client';
import { offlineChip } from './network-tone';
import type { NetworkStatus } from '@app/lib/game/randomizer-client';
import type { ProfileRandomizerConfig } from '@shared/types/profile';
import type { Chip } from './network-tone';

interface NetworkView {
  status: NetworkStatus | null;
  /** True while a session runs; false for the last session's picture or none. */
  live: boolean;
  /** The header chip of a panel with no live session behind it. */
  offline: Chip;
}

/** The last picture belongs to this profile when it was taken on the same server and slot. */
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

/** What a panel says with no picture at all to draw. */
const NOT_CONNECTED_HINT = 'Fills in once the game connects to the room.';

export { NOT_CONNECTED_HINT, networkViewOf };
export type { NetworkView };
