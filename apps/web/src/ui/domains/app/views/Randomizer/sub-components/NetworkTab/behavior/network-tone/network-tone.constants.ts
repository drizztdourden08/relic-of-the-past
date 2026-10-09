/* @layer renderer-components @kind constants */
import type { NetworkState } from '@app/lib/game/randomizer-client';
import type { Tone } from './network-tone.type';

const STALE_AFTER_MS = 15000;

const STATE_TONE: Readonly<Record<NetworkState, Tone>> = {
  connected: 'ok',
  connecting: 'warn',
  reconnecting: 'warn',
  error: 'bad',
  idle: 'idle',
};

export { STALE_AFTER_MS, STATE_TONE };
