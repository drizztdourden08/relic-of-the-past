/* @layer renderer-appshell @kind logic */
/**
 * Runs the `--dump-nav` flood and derives its annotations.
 *
 * Lives beside the pure builders, not inside them, because it DOES touch the
 * game: it goes through the same runner the simulator uses (`floodRoomRun` /
 * `floodOneOverworld`) so a dump and a run can never report different
 * reachability for the same screen. The bug this replaced was a hand-built
 * option set with an empty inventory.
 */
import type { ScreenAnnotations } from '@shared/game/simulation';
import type { GridPos } from '@shared/game/navigation';
import { annotateScreen, propagateArea } from '../../../lib/game/flood';
import { floodRoomRun } from '../../../lib/game/simulator/flood-room';
import { floodOneOverworld } from '../../../lib/game/simulator/flood-screen';
import { enrichEntrances } from '@domains/widgets/navigation/widget-helpers';
import { wasmBuildOverworldAttrGrid } from '../../../lib/game';
import { computeFloodFill, computeOverworldFloodFill } from './builders';
import { dumpFloodItems } from './flood-items';
import type { FloodFillDump } from './types';

interface RunFloodArgs {
  isIndoors: boolean;
  roomIndex: number;
  overworldScreenIndex: number;
  startPos?: GridPos;
  screenId: string | null;
  attrGrid: Uint8Array | null;
  dualLayerGrids: { layer0: number[][]; layer1: number[][]; stairTiles: Array<{ row: number; col: number }> } | null;
  playerLayer: 0 | 1 | null;
  staircaseType: number | null;
  roomLayout: { intraEdges?: Array<'north' | 'south' | 'east' | 'west'>; shape?: string; quadrantFullsizeX?: number; quadrantFullsizeY?: number } | null;
}

interface RunFloodResult {
  floodFill: FloodFillDump | null;
  /** Mechanics with their reachability, where a check the flood can't reach is `blocked`. */
  annotations: ScreenAnnotations | null;
}

const runDumpFlood = (args: RunFloodArgs): RunFloodResult => {
  const { isIndoors, roomIndex, overworldScreenIndex, startPos, screenId } = args;
  const { attrGrid, dualLayerGrids, playerLayer, staircaseType, roomLayout } = args;

  const items = dumpFloodItems();
  const roomRun = isIndoors ? floodRoomRun(roomIndex, items, startPos) : null;
  const run = isIndoors ? roomRun : floodOneOverworld(overworldScreenIndex, items, startPos);

  const floodFill = isIndoors
    ? computeFloodFill({ roomIndex, run, attrGrid, dualLayerGrids, playerLayer, staircaseType, roomLayout, startPos })
    : computeOverworldFloodFill(run, wasmBuildOverworldAttrGrid(overworldScreenIndex));

  // reachableCount/totalTiles describe the whole connected AREA (propagateArea),
  // the same total the widget shows; everything else in floodFill still
  // describes this screen alone. Without this a room that only reaches its
  // full extent through a stitched neighbour under-reports next to the widget.
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
      startPos,
      run.result.reachable,
    )
    : null;

  return { floodFill, annotations };
};

export { runDumpFlood };
export type { RunFloodArgs, RunFloodResult };
