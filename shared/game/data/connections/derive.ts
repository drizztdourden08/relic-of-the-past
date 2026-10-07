/* @layer shared-game @kind logic */
/**
 * A `ConnectionRecord` now models ONE point on ONE screen. `fromScreenId`,
 * `toScreenId`, `direction` and `counterpartId` are gone. Everything a caller used
 * to read off those fields is derived here from the pair instead, through the
 * record's own `toConnectionId`, which always resolves (see the invariant
 * suite, `tests/game/data/connection-pairing.keep.test.ts`).
 */
import { get, getConnection } from '../facade';
import type { ConnectionRecord } from '../types';
import type { ScreenId } from '../types/ids';

/** The screen this point's partner sits on. Formerly `toScreenId`. */
const toScreenIdOf = (connection: ConnectionRecord): ScreenId => getConnection(connection.toConnectionId).screenId;

/**
 * The same screen, or undefined when no record carries the partner.
 *
 * Every STORED pair resolves, which is what `toScreenIdOf` counts on. The recommendation
 * probes read a record the inspector is still editing alongside the stored ones, and a pair
 * half-written there is the one case that has no far side yet: the probes refuse to propose
 * anything for it, so they need to ask without throwing.
 */
const toScreenIdOrNone = (connection: ConnectionRecord): ScreenId | undefined =>
  get('connection', connection.toConnectionId)?.screenId;

/** A crossing is two-way exactly when BOTH ends can be exited. */
const directionOf = (connection: ConnectionRecord): 'one-way' | 'two-way' =>
  (connection.canExit && getConnection(connection.toConnectionId).canExit ? 'two-way' : 'one-way');

/** Can the player ARRIVE at this point? Only if the other side can exit. */
const isReachable = (connection: ConnectionRecord): boolean => getConnection(connection.toConnectionId).canExit;

export { directionOf, isReachable, toScreenIdOf, toScreenIdOrNone };
