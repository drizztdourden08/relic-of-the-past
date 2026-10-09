/* @layer shared-asset-extraction @kind logic */
import type { DungeonEntityRecord, DungeonRoomRecord } from '../dungeon/model';
import { BASE_ENTITY_TYPE_COUNT } from './compile-resources-gba-alttp.constants';

const supportedEntities = (room: DungeonRoomRecord): DungeonEntityRecord[] =>
  room.entities.filter(entity => entity.type < BASE_ENTITY_TYPE_COUNT);

const serializeEntityList = (room: DungeonRoomRecord): Buffer => Buffer.concat([
  Buffer.from([room.entitySortMode]),
  ...supportedEntities(room).map(entity => Buffer.from(entity.nativeBytes)),
  Buffer.from([0xff]),
]);

export { serializeEntityList };
