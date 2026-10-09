/* @layer renderer-widgets @kind logic */
import type { ConnectionRecord, ScreenId } from '@rotp/game-data';

const auditableFromHere = (screenId: ScreenId, conn: ConnectionRecord): boolean =>
  conn.screenId === screenId && conn.canExit;

export { auditableFromHere };
