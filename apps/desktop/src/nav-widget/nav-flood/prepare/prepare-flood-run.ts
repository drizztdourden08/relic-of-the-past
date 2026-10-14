/* @layer renderer-widgets @kind logic */
import { enrichEntrances } from '@rotp/navigation';
import {
  wasmGetExitScreenMap, wasmGetFallHoles, wasmGetOverworldEntrances, wasmGetRoomLayoutInfo, wasmGetViewportInfo,
} from '../../../game';
import { collectIndoorEntrances } from '../indoor-entrances';
import { liveOverworldScreenOf } from '../live-overworld-screen';
import type { FloodPrep, PrepareFloodArgs } from '../nav-flood.type';
import { buildInventory } from './build-inventory';
import { computeStartContext } from './compute-start-context';

const prepareFloodRun = (args: PrepareFloodArgs): FloodPrep => {
  const { isIndoors, activeScreenIndex, overworldScreenIndex, equipment, inventoryItems } = args;
  const vp = wasmGetViewportInfo();
  const liveOverworldScreenIndex = vp ? liveOverworldScreenOf(vp.linkX, vp.linkY) : overworldScreenIndex;
  const primaryScreenIndex = isIndoors ? activeScreenIndex : liveOverworldScreenIndex;
  const { startPos } = computeStartContext({ vp, primaryScreenIndex, isIndoors });
  const allEntrances = enrichEntrances();

  const currentRespawnIds = isIndoors
    ? collectIndoorEntrances({
      primaryScreenIndex,
      allEntrances,
      exitScreenByRoom: wasmGetExitScreenMap(),
      fallHoleEntIds: new Set(wasmGetFallHoles().map((hole) => hole.entranceId)),
      overworldDoorEntIds: new Set(wasmGetOverworldEntrances().map((entrance) => entrance.id)),
    })
    : new Set<number>();

  const roomLayout = isIndoors ? wasmGetRoomLayoutInfo() : null;

  return {
    primaryScreenIndex,
    startPos,
    items: buildInventory(equipment, inventoryItems),
    allEntrances,
    currentRespawnIds,
    roomLayout,
    intraEdges: roomLayout?.intraEdges ?? [],
  };
};

export { prepareFloodRun };
