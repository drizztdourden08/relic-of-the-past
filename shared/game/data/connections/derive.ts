/* @layer shared-game @kind logic */
/**
 * A `ConnectionRecord` now models ONE point on ONE screen — `fromScreenId`/
 * `toScreenId`/`direction`/`counterpartId` are gone. Everything a caller used
 * to read off those fields is derived here from the pair instead, through the
 * record's own `toConnectionId`, which always resolves (see the invariant
 * suite, `tests/game/data/connection-pairing.keep.test.ts`).
 */
import { getConnection } from '../facade';
import type { ConnectionRecord } from '../types';
import type { ScreenId } from '../types/ids';

/** The screen this point's partner sits on — the old `toScreenId`. */
const toScreenIdOf = (connection: ConnectionRecord): ScreenId => getConnection(connection.toConnectionId).screenId;

/** A crossing is two-way exactly when BOTH ends can be exited. */
const directionOf = (connection: ConnectionRecord): 'one-way' | 'two-way' =>
  (connection.canExit && getConnection(connection.toConnectionId).canExit ? 'two-way' : 'one-way');

/** Can the player ARRIVE at this point? Only if the other side can exit. */
const isReachable = (connection: ConnectionRecord): boolean => getConnection(connection.toConnectionId).canExit;

export { directionOf, isReachable, toScreenIdOf };
