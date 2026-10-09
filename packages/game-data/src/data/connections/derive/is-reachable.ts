/* @layer shared-game @kind logic */
import { getConnection } from '../../facade';
import type { ConnectionRecord } from '../../types';

const isReachable = (connection: ConnectionRecord): boolean => getConnection(connection.toConnectionId).canExit;

export { isReachable };
