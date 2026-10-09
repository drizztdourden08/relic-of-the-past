/* @layer renderer-widgets @kind logic */
import { findOne, toScreenIdOrNone } from '@shared/game/data';
import type { ConnectionRecord } from '@shared/game/data';

const screenExists = (id: string): boolean => findOne('screen', s => s.id === id) != null;

const endpointsResolvable = (record: ConnectionRecord): boolean => {
  const other = toScreenIdOrNone(record);
  return screenExists(record.screenId) && other !== undefined && screenExists(other);
};

export { endpointsResolvable };
