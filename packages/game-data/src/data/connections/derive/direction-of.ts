/* @layer shared-game @kind logic */
import { getConnection } from '../../facade';
import type { ConnectionRecord } from '../../types';

const directionOf = (connection: ConnectionRecord): 'one-way' | 'two-way' =>
  (connection.canExit && getConnection(connection.toConnectionId).canExit ? 'two-way' : 'one-way');

export { directionOf };
