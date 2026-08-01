/* @layer shared-game @kind logic */
/** Reverse gameId -> ActorRecord lookups, pre-built once per rebuild(). */
import type { ActorGameId, ActorRecord } from '../types';

const actorBySpriteType = new Map<number, ActorRecord>();
const actorByObjectSubIndex = new Map<number, ActorRecord>();
const actorByRoomTag = new Map<number, ActorRecord>();

const rebuildActorIndex = (records: readonly ActorRecord[]): void => {
  actorBySpriteType.clear();
  actorByObjectSubIndex.clear();
  actorByRoomTag.clear();
  for (const actor of records) {
    const { spriteType, objectSubIndex, roomTag } = actor.gameId;
    if (spriteType !== undefined && !actorBySpriteType.has(spriteType)) actorBySpriteType.set(spriteType, actor);
    if (objectSubIndex !== undefined && !actorByObjectSubIndex.has(objectSubIndex)) actorByObjectSubIndex.set(objectSubIndex, actor);
    if (roomTag !== undefined && !actorByRoomTag.has(roomTag)) actorByRoomTag.set(roomTag, actor);
  }
};

const actorByGameId = (match: Partial<ActorGameId>): ActorRecord | undefined => {
  if (match.spriteType !== undefined) return actorBySpriteType.get(match.spriteType);
  if (match.roomTag !== undefined) return actorByRoomTag.get(match.roomTag);
  if (match.objectSubIndex !== undefined) return actorByObjectSubIndex.get(match.objectSubIndex);
  return undefined;
};

export { rebuildActorIndex, actorByGameId };
