/* @layer bridge-wasm @kind logic */
import { STAIR_ID_BASE } from '@rotp/navigation';
import type { StairDestinationParams } from './stair-destination.type';

const stairDestination = (params: StairDestinationParams): number | null => {
  const { isIndoors, entranceIdx, screenIndex, entrancesFor } = params;
  const leavesIndoorGraph = !isIndoors || entranceIdx == null || entranceIdx < STAIR_ID_BASE;
  if (leavesIndoorGraph) return null;
  const destRoom = entrancesFor(screenIndex).find((e) => e.id === entranceIdx)?.roomId;
  return !destRoom || destRoom === screenIndex ? null : destRoom;
};

export { stairDestination };
