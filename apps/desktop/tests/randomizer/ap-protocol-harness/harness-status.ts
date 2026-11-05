/* @layer tests @kind helper */
import type { ConnectionState } from '@drizztdourden08/brock-randomizer/archipelago';
import type { HarnessStatus } from './harness-session.type';

const ONLINE_PREFIX = '[Online] ';

const STATUS_OF: Record<ConnectionState, HarnessStatus> = {
  idle: 'idle',
  closed: 'idle',
  connecting: 'connecting',
  connected: 'active',
  reconnecting: 'reconnecting',
  refused: 'error',
};

const statusOf = (state: ConnectionState): HarnessStatus => STATUS_OF[state];

const connectionErrorOf = (state: ConnectionState, reason: string): string | null =>
  state === 'refused' ? reason.replace(ONLINE_PREFIX, '') : null;

export { connectionErrorOf, statusOf };
