/* @layer renderer-appshell @kind logic */
import { propagateArea } from '@app/game/flood';
import { enrichEntrances } from '@rotp/navigation';
import type { AreaTotalsParams, FloodFillDump } from './dump-nav.type';

const applyAreaTotals = (floodFill: FloodFillDump, params: AreaTotalsParams): void => {
  const { args, items, roomRun } = params;
  const { isIndoors, roomIndex, overworldScreenIndex, startPos, roomLayout } = args;

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
};

export { applyAreaTotals };
