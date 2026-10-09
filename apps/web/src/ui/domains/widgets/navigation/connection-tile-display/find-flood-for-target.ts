/* @layer renderer-widgets @kind logic */
import type { ConnectionInfo } from '@shared/game/navigation';
import { resolveRealDestId } from '../connection-audit-resolve';

const findFloodForTarget = (floodConnections: ConnectionInfo[], toId: string): ConnectionInfo | undefined => {
  return floodConnections.find(info =>
    resolveRealDestId('screen', info.targetScreen) === toId
    || resolveRealDestId('room', info.targetScreen) === toId);
};

export { findFloodForTarget };
