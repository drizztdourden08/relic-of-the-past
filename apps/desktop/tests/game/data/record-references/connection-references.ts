/* @layer tests @kind helper */
import type { ConnectionRecord } from '@rotp/game-data';
import type { Sink } from './record-references.type';
import { walkRequirement } from './walk-requirement';

const connectionReferences = (connection: ConnectionRecord, take: Sink): void => {
  take('screen', 'screenId', connection.screenId);
  take('connection', 'toConnectionId', connection.toConnectionId);
  take('dungeon', 'dungeonId', connection.dungeonId);
  take('actor', 'gatedBy', connection.gatedBy);
  for (const id of connection.tags) take('tag', 'tags', id);
  if (connection.requirements) walkRequirement(connection.requirements, 'requirements', take);
};

export { connectionReferences };
