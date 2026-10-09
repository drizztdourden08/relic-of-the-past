/* @layer bridge-wasm @kind constants */
import type { NetworkState, PermissionMode } from './network-status.type';
import type { RandomizerSession } from './session.type';

const STATE_OF_STATUS: Readonly<Record<RandomizerSession['status'], NetworkState>> = {
  idle: 'idle',
  starting: 'connecting',
  active: 'connected',
  reconnecting: 'reconnecting',
  error: 'error',
};

const PERMISSION_MODES: Readonly<Record<number, PermissionMode>> = {
  0: 'disabled', 1: 'enabled', 2: 'goal', 6: 'auto', 7: 'auto-enabled',
};

const PERCENT = 0.01;

const MIN_PAID_HINT_COST = 1;

export { MIN_PAID_HINT_COST, PERCENT, PERMISSION_MODES, STATE_OF_STATUS };
