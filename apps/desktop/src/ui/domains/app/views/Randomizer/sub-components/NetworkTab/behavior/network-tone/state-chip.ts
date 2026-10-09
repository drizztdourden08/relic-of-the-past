/* @layer renderer-components @kind logic */
import { formatCountdown } from '../network-format';
import type { NetworkConnection } from '@app/lib/game/randomizer-client';
import { STATE_TONE } from './network-tone.constants';
import type { Chip } from './network-tone.type';

const stateChip = (connection: NetworkConnection, now: number): Chip => {
  const { state, reconnectAttempt, nextRetryAt, retryInFlight } = connection;
  if (state === 'reconnecting') {
    const when = retryInFlight ? 'trying now' : `try ${reconnectAttempt} in ${formatCountdown(nextRetryAt, now)}`;
    return { tone: 'warning', label: `reconnecting, ${when}` };
  }
  return { tone: STATE_TONE[state], label: state };
};

export { stateChip };
