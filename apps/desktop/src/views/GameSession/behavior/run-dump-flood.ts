/* @layer renderer-appshell @kind logic */
import { floodRoomRun, floodOneOverworld } from '@rotp/navigation';
import { wasmBuildOverworldAttrGrid } from '@app/game';
import { computeFloodFill } from './compute-flood-fill';
import { computeOverworldFloodFill } from './compute-overworld-flood-fill';
import { dumpFloodItems } from './dump-flood-items';
import { applyAreaTotals } from './apply-area-totals';
import { annotateDump } from './annotate-dump';
import type { RunFloodArgs, RunFloodResult } from './dump-nav.type';

const runDumpFlood = (args: RunFloodArgs): RunFloodResult => {
  const { isIndoors, roomIndex, overworldScreenIndex, startPos } = args;
  const { attrGrid, dualLayerGrids, playerLayer, staircaseType, roomLayout } = args;

  const items = dumpFloodItems();
  const roomRun = isIndoors ? floodRoomRun(roomIndex, items, startPos) : null;
  const run = isIndoors ? roomRun : floodOneOverworld(overworldScreenIndex, items, startPos);

  const floodFill = isIndoors
    ? computeFloodFill({ roomIndex, run, attrGrid, dualLayerGrids, playerLayer, staircaseType, roomLayout, startPos })
    : computeOverworldFloodFill(run, wasmBuildOverworldAttrGrid(overworldScreenIndex));

  if (floodFill && run) applyAreaTotals(floodFill, { args, items, roomRun });

  return { floodFill, annotations: annotateDump(args, run) };
};

export { runDumpFlood };
export type { RunFloodArgs, RunFloodResult };
