/* @layer renderer-widgets @kind logic */
import type { ConnectionRecord, ScreenId } from '@rotp/game-data';
import { toScreenIdOrNone } from '@rotp/game-data';

const otherEndpoint = (_screenId: ScreenId, conn: ConnectionRecord): ScreenId | undefined =>
  toScreenIdOrNone(conn);

export { otherEndpoint };
