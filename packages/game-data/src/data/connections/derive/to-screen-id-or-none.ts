/* @layer shared-game @kind logic */
import { get } from '../../facade';
import type { ConnectionRecord } from '../../types';
import type { ScreenId } from '../../types/ids';

const toScreenIdOrNone = (connection: ConnectionRecord): ScreenId | undefined =>
  get('connection', connection.toConnectionId)?.screenId;

export { toScreenIdOrNone };
