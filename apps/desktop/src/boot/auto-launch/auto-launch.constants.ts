/* @layer renderer-app @kind constants */
import type { ConnectionVerdict } from './auto-launch.type';

const CONNECTION_WAIT_MS = 5 * 60_000;

const CONNECTION_FAILURE_TEXT: Readonly<Record<Exclude<ConnectionVerdict, 'connected' | 'cancelled'>, string>> = {
  failed: '[AutoTest] The Archipelago client stopped before it connected, so the save load and input script do not run',
  'timed-out': '[AutoTest] The Archipelago client did not connect within 5 minutes, so the save load and input script do not run',
};

export { CONNECTION_FAILURE_TEXT, CONNECTION_WAIT_MS };
