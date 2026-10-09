/* @layer renderer-widgets @kind logic */
import { toScreenIdOf } from '@rotp/game-data';
import type { ConnectionRecord, ConnectionTag, PendingConnectionRecord } from '@rotp/game-data';
import { buildConnectionRecord } from './build-connection-record';

const rewriteConnectionRecord = (record: ConnectionRecord, tags: readonly ConnectionTag[]): PendingConnectionRecord | null => {
  const rebuilt = buildConnectionRecord({ screenId: record.screenId, toScreenId: toScreenIdOf(record), tags });
  if (!rebuilt) return null;
  return {
    ...rebuilt,
    gameId: record.gameId,
    placement: record.placement,
    canExit: record.canExit,
    gatedBy: record.gatedBy,
    requirements: record.requirements,
    name: record.name,
    nav: record.nav,
  };
};

export { rewriteConnectionRecord };
