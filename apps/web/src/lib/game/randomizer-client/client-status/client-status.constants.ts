/* @layer bridge-wasm @kind constants */
import type { PlayerStatus } from './client-status.type';

const STATUS_OF_VALUE: Readonly<Record<number, PlayerStatus>> = {
  0: 'unknown', 5: 'connected', 10: 'ready', 20: 'playing', 30: 'goal',
};

const KEY_PREFIX = '_read_client_status_';
const KEY_PATTERN = /^_read_client_status_(\d+)_(\d+)$/;

export { KEY_PATTERN, KEY_PREFIX, STATUS_OF_VALUE };
