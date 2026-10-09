/* @layer shared-game @kind logic */
import type { ActorRecord } from '../../types';
import { actorIndexMaps } from './actor-index-maps';

const rebuildActorIndex = (records: readonly ActorRecord[]): void => {
  const { bySpriteType, byObjectSubIndex, byRoomTag, allBySpriteType } = actorIndexMaps;
  bySpriteType.clear();
  byObjectSubIndex.clear();
  byRoomTag.clear();
  allBySpriteType.clear();
  for (const actor of records) {
    const { spriteType, objectSubIndex, roomTag } = actor.gameId;
    if (spriteType !== undefined && !bySpriteType.has(spriteType)) bySpriteType.set(spriteType, actor);
    if (spriteType !== undefined) {
      const list = allBySpriteType.get(spriteType);
      if (list) list.push(actor);
      else allBySpriteType.set(spriteType, [actor]);
    }
    if (objectSubIndex !== undefined && !byObjectSubIndex.has(objectSubIndex)) byObjectSubIndex.set(objectSubIndex, actor);
    if (roomTag !== undefined && !byRoomTag.has(roomTag)) byRoomTag.set(roomTag, actor);
  }
};

export { rebuildActorIndex };
