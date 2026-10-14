/* @layer renderer-components @kind logic */
import type { NetworkStatus } from '@app/game/randomizer-client';
import { NOT_CONNECTED_CHIP } from '../sub-components/NetworkPill.constants';
import { healthChip } from './health-chip';
import type { Chip } from './network-tone.type';
import { stateChip } from './state-chip';

const pillChip = (status: NetworkStatus | null, now: number): Chip => {
  if (status === null) return NOT_CONNECTED_CHIP;
  return status.connection.state === 'connected' ? healthChip(status, now) : stateChip(status.connection, now);
};

export { pillChip };
