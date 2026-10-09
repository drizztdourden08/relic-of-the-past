/* @layer bridge-wasm @kind logic */
import { readMapState } from '../simulator/read-game-state';

const isLoadedRoom = (roomId: number): boolean => {
  const live = readMapState();
  return live?.isIndoors === true && live.roomIndex === roomId;
};

export { isLoadedRoom };
