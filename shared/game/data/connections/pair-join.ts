/* @layer shared-game @kind logic */
/**
 * "Is there already a stored crossing between these two screens?" — the one
 * question the connection audit and the completeness badge both ask, answered
 * here once so they cannot answer it differently.
 *
 * A stored crossing is a PAIR of points, one sitting on each screen (see
 * `derive.ts`), and either point proves the link. So the answer must not depend
 * on which side of the pair the caller happens to be holding, nor on `canExit`
 * — that flag says whether the crossing can be TAKEN from a given side, which
 * is a different question from whether the dataset knows about it at all.
 */
import { toScreenIdOf } from './derive';
import type { ConnectionRecord } from '../types';
import type { ScreenId } from '../types/ids';

/** Does this one point, with its partner, span `a` and `b` either way round? */
const linksScreens = (connection: ConnectionRecord, a: ScreenId, b: ScreenId): boolean =>
  (connection.screenId === a && toScreenIdOf(connection) === b)
  || (connection.screenId === b && toScreenIdOf(connection) === a);

/** Does any stored pair among `connections` link `a` and `b`, in either direction? */
const pairLinksScreens = (connections: readonly ConnectionRecord[], a: ScreenId, b: ScreenId): boolean =>
  connections.some(connection => linksScreens(connection, a, b));

export { pairLinksScreens };
