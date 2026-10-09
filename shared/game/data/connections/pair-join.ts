/* @layer shared-game @kind logic */
import { toScreenIdOf } from './derive';
import type { ConnectionRecord } from '../types';
import type { ScreenId } from '../types/ids';

const linksScreens = (connection: ConnectionRecord, a: ScreenId, b: ScreenId): boolean =>
  (connection.screenId === a && toScreenIdOf(connection) === b)
  || (connection.screenId === b && toScreenIdOf(connection) === a);

const pairLinksScreens = (connections: readonly ConnectionRecord[], a: ScreenId, b: ScreenId): boolean =>
  connections.some(connection => linksScreens(connection, a, b));

export { pairLinksScreens };
