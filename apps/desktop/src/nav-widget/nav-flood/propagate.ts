/* @layer renderer-widgets @kind logic */
import { buildScreenBundle } from '@rotp/game-data';
import type { ScreenBundleGrid } from '@rotp/game-data';
import type { TileReq } from '@rotp/game-data';
import { computeBigScreenGroup } from '../widget-helpers';
import { propagateArea } from '../../game/flood';
import type { PropagateCtx, ScreenResponse } from './nav-flood.type';

const propagateScreens = (ctx: PropagateCtx): { responses: ScreenResponse[]; overworldBundle: ScreenBundleGrid | null } => {
  const { isIndoors, primaryScreenIndex, startPos, items, allEntrances, intraEdges } = ctx;
  const overworldBundle = isIndoors ? null : buildScreenBundle(computeBigScreenGroup(primaryScreenIndex));
  const screens = propagateArea({
    isIndoors,
    primaryScreenIndex,
    items: items as TileReq[],
    entrances: allEntrances,
    intraEdges,
    atPlayer: true,
    ...(startPos ? { startPos } : {}),
  });
  const responses = screens.map((s) => ({
    screenIndex: s.screenIndex,
    result: s.result,
    connections: s.connections,
    dynamicBlockers: s.result.dynamicBlockerCells,
  }));
  return { responses, overworldBundle };
};

export { propagateScreens };
export type { ScreenResponse } from './nav-flood.type';
