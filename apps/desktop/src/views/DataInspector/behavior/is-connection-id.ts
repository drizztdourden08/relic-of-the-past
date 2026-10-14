/* @layer renderer-app @kind logic */
import type { ConnectionId } from '@rotp/game-data';

const isConnectionId = (id: string): id is ConnectionId => id.startsWith('connection-');

export { isConnectionId };
