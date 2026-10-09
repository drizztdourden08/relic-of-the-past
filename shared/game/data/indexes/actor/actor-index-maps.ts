/* @layer shared-game @kind logic */
import type { ActorRecord } from '../../types';

const actorIndexMaps = {
  bySpriteType: new Map<number, ActorRecord>(),
  byObjectSubIndex: new Map<number, ActorRecord>(),
  byRoomTag: new Map<number, ActorRecord>(),
  allBySpriteType: new Map<number, ActorRecord[]>(),
};

export { actorIndexMaps };
