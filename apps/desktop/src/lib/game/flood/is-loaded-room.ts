/* @layer bridge-wasm @kind logic */
import { readMapState } from '@rotp/game-core';

const isLoadedRoom = (roomId: number): boolean => {
  const live = readMapState();
  return live?.isIndoors === true && live.roomIndex === roomId;
};

export { isLoadedRoom };
