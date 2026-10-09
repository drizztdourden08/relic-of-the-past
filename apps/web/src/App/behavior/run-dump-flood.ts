/* @layer renderer-appshell @kind logic */
import { annotateScreen, propagateArea } from '../../lib/game/flood';
import { floodRoomRun } from '../../lib/game/simulator/flood-room';
import { floodOneOverworld } from '../../lib/game/simulator/flood-screen';
import { enrichEntrances } from '@app/lib/game/flood/overworld-entrances';
import { wasmBuildOverworldAttrGrid } from '../../lib/game';
import { computeFloodFill } from './compute-flood-fill';
import { computeOverworldFloodFill } from './compute-overworld-flood-fill';
import { dumpFloodItems } from './dump-flood-items';
import type { RunFloodArgs, RunFloodResult } from './dump-nav.type';

const runDumpFlood = (args: RunFloodArgs): RunFloodResult => {
  const { isIndoors, roomIndex, overworldScreenIndex, startPos, screenId } = args;
  const { attrGrid, dualLayerGrids, playerLayer, staircaseType, roomLayout } = args;

  const items = dumpFloodItems();
  const roomRun = isIndoors ? floodRoomRun(roomIndex, items, startPos) : null;
  const run = isIndoors ? roomRun : floodOneOverworld(overworldScreenIndex, items, startPos);

  const floodFill = isIndoors
    ? computeFloodFill({ roomIndex, run, attrGrid, dualLayerGrids, playerLayer, staircaseType, roomLayout, startPos })
    : computeOverworldFloodFill(run, wasmBuildOverworldAttrGrid(overworldScreenIndex));

  if (floodFill && run) {
    const areaResults = propagateArea({
      isIndoors,
      primaryScreenIndex: isIndoors ? roomIndex : overworldScreenIndex,
      items,
      startPos,
      atPlayer: true,
      entrances: roomRun ? roomRun.entrances : enrichEntrances(),
      ...(isIndoors ? { intraEdges: roomLayout?.intraEdges ?? [] } : {}),
    });
    floodFill.reachableCount = areaResults.reduce((sum, r) => sum + r.result.reachableCount, 0);
    floodFill.totalTiles = areaResults.reduce((sum, r) => sum + r.result.totalTiles, 0);
  }

  const annotations = screenId && run
    ? annotateScreen(
      screenId,
      { isIndoors, roomId: isIndoors ? roomIndex : 0, owScreenIndex: isIndoors ? 0 : overworldScreenIndex },
      run.result.reachable,
    )
    : null;

  return { floodFill, annotations };
};

export { runDumpFlood };
export type { RunFloodArgs, RunFloodResult };
