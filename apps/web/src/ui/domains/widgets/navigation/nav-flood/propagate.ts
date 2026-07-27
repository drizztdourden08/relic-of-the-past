/* @layer renderer-widgets @kind logic */
/**
 * Multi-screen flood propagation for the widget.
 *
 * This is an adapter now, not an implementation: the flood itself lives in
 * lib/game/flood/flood-area.ts and the simulator runs the very same code. The
 * widget used to assemble FloodFillOptions by hand and read its solid-sprite
 * blockers from the live sprite list, which made its numbers diverge from the
 * simulator's on every screen the game was not standing on — exactly the numbers
 * you reach for when a simulator run looks wrong.
 */
import { buildScreenBundle } from '@shared/game/navigation';
import type { ConnectionInfo, FloodFillResult, ScreenBundle } from '@shared/game/navigation';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import type { enrichEntrances } from '../widget-helpers';
import { computeBigScreenGroup } from '../widget-helpers';
import { propagateArea } from '../../../../../lib/game/flood';

type EdgeName = 'north' | 'south' | 'east' | 'west';
type Cell = { row: number; col: number };

interface ScreenResponse {
  screenIndex: number;
  result: FloodFillResult;
  connections: ConnectionInfo[];
  /** Kept for the widget's blocker tally; the flood reports its own cells too. */
  dynamicBlockers: Cell[] | undefined;
}

interface PropagateCtx {
  isIndoors: boolean;
  primaryScreenIndex: number;
  startPos: Cell | undefined;
  items: string[];
  allEntrances: ReturnType<typeof enrichEntrances>;
  intraEdges: EdgeName[];
}

const propagateScreens = (ctx: PropagateCtx): { responses: ScreenResponse[]; overworldBundle: ScreenBundle | null } => {
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
export type { ScreenResponse };
