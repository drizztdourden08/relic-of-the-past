/* @layer shared-game @kind logic */
import type { ActorGameId, ActorRecord } from '../../types';
import { actorIndexMaps } from './actor-index-maps';

const actorByGameId = (match: Partial<ActorGameId>): ActorRecord | undefined => {
  if (match.spriteType !== undefined) return actorIndexMaps.bySpriteType.get(match.spriteType);
  if (match.roomTag !== undefined) return actorIndexMaps.byRoomTag.get(match.roomTag);
  if (match.objectSubIndex !== undefined) return actorIndexMaps.byObjectSubIndex.get(match.objectSubIndex);
  return undefined;
};

export { actorByGameId };
