/* @layer shared-game @kind logic */
/**
 * Reverse gameId -> ActorRecord lookups, pre-built once per rebuild().
 *
 * A native type byte is not unique: several records can share one, because the
 * game reuses a single entity type for what the dataset treats as distinct
 * actors (different states of the same character, or two characters drawn by one
 * routine). The single-value maps answer "the record for this byte" and keep the
 * first registered record, which is what every existing caller expects; the
 * list map answers "every record for this byte", which is what a join has to ask
 * when the byte alone cannot pick a winner.
 */
import type { ActorGameId, ActorRecord } from '../types';

const actorBySpriteType = new Map<number, ActorRecord>();
const actorByObjectSubIndex = new Map<number, ActorRecord>();
const actorByRoomTag = new Map<number, ActorRecord>();
const actorsBySpriteType = new Map<number, ActorRecord[]>();

const rebuildActorIndex = (records: readonly ActorRecord[]): void => {
  actorBySpriteType.clear();
  actorByObjectSubIndex.clear();
  actorByRoomTag.clear();
  actorsBySpriteType.clear();
  for (const actor of records) {
    const { spriteType, objectSubIndex, roomTag } = actor.gameId;
    if (spriteType !== undefined && !actorBySpriteType.has(spriteType)) actorBySpriteType.set(spriteType, actor);
    if (spriteType !== undefined) {
      const list = actorsBySpriteType.get(spriteType);
      if (list) list.push(actor);
      else actorsBySpriteType.set(spriteType, [actor]);
    }
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

/** Every record carrying `spriteType`, in registration order; empty when none does. */
const actorsByGameSpriteType = (spriteType: number): ActorRecord[] => (
  actorsBySpriteType.get(spriteType) ?? []
);

export { rebuildActorIndex, actorByGameId, actorsByGameSpriteType };
