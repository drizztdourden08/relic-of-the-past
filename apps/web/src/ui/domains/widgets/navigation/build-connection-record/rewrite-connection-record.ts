/* @layer renderer-widgets @kind logic */
import { toScreenIdOf } from '@shared/game/data';
import type { ConnectionRecord, ConnectionTag } from '@shared/game/data';
import type { PendingConnectionRecord } from '@shared/game/data/record-codegen';
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
