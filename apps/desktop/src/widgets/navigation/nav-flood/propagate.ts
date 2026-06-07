/* @layer renderer-widgets @kind logic */
/** Multi-screen flood-fill propagation: per-screen run + border-transition BFS. */
import { wasmBuildOverworldAttrGrid, wasmGetOverworldVariant, wasmGetStaircaseType } from '../../../lib/game';
import { floodFillScreen, getConnections, buildScreenBundle } from '@shared/game/navigation';
import type { FloodFillOptions, FloodFillResult, ConnectionInfo, ScreenBundle } from '@shared/game/navigation';
import type { TileReq, TileAttrContext } from '@shared/game/navigation/tile-attrs';
import { uint8ToGrid, computeBigScreenGroup } from '../widget-helpers';
import type { enrichEntrances } from '../widget-helpers';
import type { DualLayerGrids, Point } from './prepare';

type EdgeName = 'north' | 'south' | 'east' | 'west';
type Cell = { row: number; col: number };
interface ScreenResponse {
  screenIndex: number;
  result: FloodFillResult;
  connections: ConnectionInfo[];
  dynamicBlockers: Cell[] | undefined;
}

interface PropagateCtx {
  isIndoors: boolean;
  primaryScreenIndex: number;
  startPos: Cell | undefined;
  rawAttrGrid: number[][] | undefined;
  items: string[];
  tileContext: TileAttrContext;
  allEntrances: ReturnType<typeof enrichEntrances>;
  exitScreenByRoom: Map<number, number>;
  intraEdges: EdgeName[];
  dualLayerGrids: DualLayerGrids | undefined;
  linkLayer: 0 | 1 | undefined;
  blockerWorldPoints: Point[];
}

const propagateScreens = (ctx: PropagateCtx): { responses: ScreenResponse[]; overworldBundle: ScreenBundle | null } => {
  const {
    isIndoors, primaryScreenIndex, startPos, rawAttrGrid, items, tileContext,
    allEntrances, exitScreenByRoom, intraEdges, dualLayerGrids, linkLayer, blockerWorldPoints,
  } = ctx;

  // Helper to build dynamic blockers for a given screen
  const getBlockersForScreen = (screenIndex: number) => !isIndoors
    ? blockerWorldPoints
      .map(b => ({
        row: Math.floor((b.y - (((screenIndex >> 3) & 7) * 512)) / 8),
        col: Math.floor((b.x - ((screenIndex & 7) * 512)) / 8),
      }))
      .filter(p => p.row >= 0 && p.row < 64 && p.col >= 0 && p.col < 64)
    : undefined;

  // Helper to run flood fill for one screen directly via orchestrator
  const runOneScreen = (screenIndex: number, sp?: Cell, extraSeeds?: Cell[]): ScreenResponse | null => {
    let grid: number[][];
    if (isIndoors) {
      if (!rawAttrGrid) return null;
      grid = rawAttrGrid;
    } else {
      const raw = wasmBuildOverworldAttrGrid(screenIndex);
      if (!raw) return null;
      grid = uint8ToGrid(raw);
    }
    const runVariant = (!isIndoors) ? wasmGetOverworldVariant(screenIndex) : null;
    const dynamicBlockers = getBlockersForScreen(screenIndex);

    const opts: FloodFillOptions = {
      tileContext,
      inventory: new Set<TileReq>(items as TileReq[]),
      startPos: sp,
      dynamicBlockers,
      entrances: allEntrances,
      exitScreenByRoom,
      quadrantBounds: undefined,
      dualLayerGrids: isIndoors ? dualLayerGrids : undefined,
      stairTiles: isIndoors ? dualLayerGrids?.stairTiles : undefined,
      startLayer: isIndoors ? linkLayer : undefined,
      staircaseType: isIndoors ? (wasmGetStaircaseType?.() ?? undefined) : undefined,
      extraSeeds,
      variant: runVariant ? {
        progressTier: runVariant.progressIndicator,
        eventOverlay: runVariant.eventOverlayActive,
        eventFlags: runVariant.screenEventFlags,
      } : undefined,
    };
    const result = floodFillScreen(grid, screenIndex, opts);
    const connections = getConnections(result, isIndoors ? intraEdges : undefined);
    return { screenIndex, result, connections, dynamicBlockers };
  };

  // Run primary screen first (from Link's position), then iteratively propagate.
  // Indoors: single room only (loading adjacent rooms via wasmBuildRoomAttrGrid
  // corrupts the live game's collision state because Dungeon_LoadRoom is destructive).
  // Outdoors: propagate within the same big-screen group.
  const groupScreens = isIndoors ? [primaryScreenIndex] : computeBigScreenGroup(primaryScreenIndex);
  const allowedScreens = new Set<number>(groupScreens);
  // Indoors: single-room flood fill only (wasmBuildRoomAttrGrid is destructive).
  // We set the screen bundle AFTER flood fill to include adjacent rooms from edges.
  const overworldBundle = !isIndoors ? buildScreenBundle(groupScreens) : null;

  const MAX_ITERATIONS = 8;
  let iterations = 0;
  const analyzed = new Map<number, ScreenResponse>();
  const pendingSeeds = new Map<number, Cell[]>();

  pendingSeeds.set(primaryScreenIndex, [startPos!]);

  while (pendingSeeds.size > 0 && iterations < MAX_ITERATIONS) {
    iterations++;
    const batch = [...pendingSeeds.entries()];
    pendingSeeds.clear();

    for (const [screenIndex, seedList] of batch) {
      const sp = seedList[0];
      const entry = runOneScreen(screenIndex, sp, seedList.length > 1 ? seedList.slice(1) : undefined);
      if (!entry) continue;
      analyzed.set(screenIndex, entry);

      // Extract border transitions to discover new adjacent screens
      for (const t of entry.result.transitions) {
        if (t.edge === 'entrance') continue;
        let adjScreen: number | null = null;
        let entryPos: Cell | null = null;
        const sRow = (screenIndex >> 3) & 7;
        const sCol = screenIndex & 7;
        switch (t.edge) {
          case 'north': adjScreen = sRow > 0 ? ((sRow - 1) << 3 | sCol) : null; entryPos = { row: 63, col: t.col }; break;
          case 'south': adjScreen = sRow < 7 ? ((sRow + 1) << 3 | sCol) : null; entryPos = { row: 0, col: t.col }; break;
          case 'west': adjScreen = sCol > 0 ? (sRow << 3 | (sCol - 1)) : null; entryPos = { row: t.row, col: 63 }; break;
          case 'east': adjScreen = sCol < 7 ? (sRow << 3 | (sCol + 1)) : null; entryPos = { row: t.row, col: 0 }; break;
        }
        if (adjScreen === null || entryPos === null) continue;
        if (!allowedScreens.has(adjScreen)) continue;
        if (analyzed.has(adjScreen)) continue;
        const existing = pendingSeeds.get(adjScreen) ?? [];
        existing.push(entryPos);
        pendingSeeds.set(adjScreen, existing);
      }
    }
  }

  const responses = [...analyzed.values()];
  return { responses, overworldBundle };
};

export { propagateScreens };
export type { ScreenResponse };
