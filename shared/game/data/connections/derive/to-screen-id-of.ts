/* @layer shared-game @kind logic */
import { getConnection } from '../../facade';
import type { ConnectionRecord } from '../../types';
import type { ScreenId } from '../../types/ids';

const toScreenIdOf = (connection: ConnectionRecord): ScreenId => getConnection(connection.toConnectionId).screenId;

export { toScreenIdOf };
