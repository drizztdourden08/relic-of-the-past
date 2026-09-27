/* @layer renderer-components @kind logic */
/**
 * The chips of the network tab: a tone (ok, warn, bad, idle, dim) and a short label. The link is
 * healthy while connected and a packet arrived in the last STALE_AFTER_MS; the ping alone
 * brings one every five seconds, so a longer silence means the room stopped answering.
 */
import { formatCountdown } from './network-format';
import type { NetworkConnection, NetworkState, NetworkStatus } from '@app/lib/game/randomizer-client';

/** `dim`: nothing is known, quieter than idle. */
type Tone = 'ok' | 'warn' | 'bad' | 'idle' | 'dim';

interface Chip {
  tone: Tone;
  label: string;
}

const STALE_AFTER_MS = 15000;

const STATE_TONE: Readonly<Record<NetworkState, Tone>> = {
  connected: 'ok',
  connecting: 'warn',
  reconnecting: 'warn',
  error: 'bad',
  idle: 'idle',
};

const stateChip = (connection: NetworkConnection, now: number): Chip => {
  const { state, reconnectAttempt, nextRetryAt, retryInFlight } = connection;
  if (state === 'reconnecting') {
    const when = retryInFlight ? 'trying now' : `try ${reconnectAttempt} in ${formatCountdown(nextRetryAt, now)}`;
    return { tone: 'warn', label: `reconnecting, ${when}` };
  }
  return { tone: STATE_TONE[state], label: state };
};

const healthChip = (status: NetworkStatus, now: number): Chip => {
  const { connection, health } = status;
  if (connection.state !== 'connected') return { tone: STATE_TONE[connection.state], label: connection.state };
  const quiet = health.lastPacketAt === null || now - health.lastPacketAt > STALE_AFTER_MS;
  return quiet ? { tone: 'warn', label: 'no reply' } : { tone: 'ok', label: 'healthy' };
};

const onlineChip = (online: boolean | null): Chip => {
  if (online === null) return { tone: 'dim', label: 'unknown' };
  // Another player being away is ordinary, so offline takes no alarm colour.
  return online ? { tone: 'ok', label: 'online' } : { tone: 'idle', label: 'offline' };
};

export { healthChip, onlineChip, stateChip, STALE_AFTER_MS };
export type { Chip, Tone };
