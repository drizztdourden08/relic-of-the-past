/* @layer renderer-widgets @kind logic */
import type { ConnectionRecord, ScreenId } from '@shared/game/data';
import { toScreenIdOrNone } from '@shared/game/data';

const otherEndpoint = (_screenId: ScreenId, conn: ConnectionRecord): ScreenId | undefined =>
  toScreenIdOrNone(conn);

export { otherEndpoint };
