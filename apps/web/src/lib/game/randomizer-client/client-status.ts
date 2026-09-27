/* @layer bridge-wasm @kind logic */
/**
 * A slot's client status, as the server keeps it under the read-only data storage key
 * `_read_client_status_<team>_<slot>`: 0 unknown, 5 connected, 10 ready, 20 playing, 30 goal.
 * The server sets 5 when the first client of a slot joins and 0 when the last one leaves;
 * goal is never undone.
 */

type PlayerStatus = 'unknown' | 'connected' | 'ready' | 'playing' | 'goal';

const STATUS_OF_VALUE: Readonly<Record<number, PlayerStatus>> = {
  0: 'unknown', 5: 'connected', 10: 'ready', 20: 'playing', 30: 'goal',
};

const KEY_PREFIX = '_read_client_status_';
const KEY_PATTERN = /^_read_client_status_(\d+)_(\d+)$/;

const clientStatusKey = (team: number, slot: number): string => `${KEY_PREFIX}${team}_${slot}`;

/** The slot a status key names, when it names one on this team. */
const slotOfStatusKey = (key: string, team: number): number | null => {
  const match = KEY_PATTERN.exec(key);
  if (match === null || Number(match[1]) !== team) return null;
  return Number(match[2]);
};

const playerStatusOf = (value: unknown): PlayerStatus =>
  (typeof value === 'number' ? STATUS_OF_VALUE[value] ?? 'unknown' : 'unknown');

/** A status a client has to be connected to hold: goal outlives the client, unknown says nothing. */
const statusImpliesOnline = (status: PlayerStatus): boolean | null => {
  if (status === 'goal') return null;
  return status !== 'unknown';
};

export { clientStatusKey, playerStatusOf, slotOfStatusKey, statusImpliesOnline };
export type { PlayerStatus };
