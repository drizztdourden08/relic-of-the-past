/* @layer renderer-components @kind logic */
import type { NetworkStatus } from '@app/lib/game/randomizer-client';
import { STALE_AFTER_MS, STATE_TONE } from './network-tone.constants';
import type { Chip } from './network-tone.type';

const healthChip = (status: NetworkStatus, now: number): Chip => {
  const { connection, health } = status;
  if (connection.state !== 'connected') return { tone: STATE_TONE[connection.state], label: connection.state };
  const quiet = health.lastPacketAt === null || now - health.lastPacketAt > STALE_AFTER_MS;
  return quiet ? { tone: 'warning', label: 'no reply' } : { tone: 'success', label: 'healthy' };
};

export { healthChip };
