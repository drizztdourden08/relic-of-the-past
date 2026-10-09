/* @layer bridge-wasm @kind logic */
import type { SimLocation } from '../../simulation';
import { floodFillScreen, getConnections } from '../../pathfinding';
import { buildFloodOptions } from '../flood-options';
import { getScreenGrids } from '../screen-grids';
import type { ScreenFloodRequest, ScreenFloodResult } from './flood-area.type';

const floodOneScreen = (location: SimLocation, req: ScreenFloodRequest): ScreenFloodResult | null => {
  const { items, startPos, extraSeeds, atPlayer, entrances, intraEdges } = req;
  const bundle = getScreenGrids(location);
  if (!bundle.rawAttrGrid.length) return null;
  const options = buildFloodOptions({ location, items, startPos, extraSeeds, atPlayer, entrances }, bundle);
  const result = floodFillScreen(bundle.rawAttrGrid, bundle.screenIndex, options);
  return {
    screenIndex: bundle.screenIndex,
    result,
    connections: getConnections(result, intraEdges && intraEdges.length > 0 ? intraEdges : undefined),
  };
};

export { floodOneScreen };
