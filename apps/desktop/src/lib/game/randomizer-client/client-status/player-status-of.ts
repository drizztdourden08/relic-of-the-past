/* @layer bridge-wasm @kind logic */
import { STATUS_OF_VALUE } from './client-status.constants';
import type { PlayerStatus } from './client-status.type';

const playerStatusOf = (value: unknown): PlayerStatus =>
  (typeof value === 'number' ? STATUS_OF_VALUE[value] ?? 'unknown' : 'unknown');

export { playerStatusOf };
