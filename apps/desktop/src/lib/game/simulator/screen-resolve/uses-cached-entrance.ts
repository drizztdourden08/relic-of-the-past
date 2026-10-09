/* @layer bridge-wasm @kind logic */
import { CACHED_ENTRANCE_END_ROOM, CACHED_ENTRANCE_FIRST_ROOM, UNCACHED_ROOM } from './screen-resolve.constants';

const usesCachedEntrance = (roomId: number): boolean =>
  roomId >= CACHED_ENTRANCE_FIRST_ROOM && roomId < CACHED_ENTRANCE_END_ROOM && roomId !== UNCACHED_ROOM;

export { usesCachedEntrance };
