/**
 * FloodFillSessionBuilder — encapsulates the data preparation for a flood fill run.
 *
 * Gathers all WASM state needed for BFS into a pure-data session object,
 * separating data acquisition from BFS execution and UI state management.
 */

import type { TileAttrContext } from '@shared/game/navigation/tile-attrs';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import type { FloodFillOptions, QuadrantBounds } from '@shared/game/navigation';
import type { OverworldEntrance } from '@shared/game/navigation';

interface FloodFillSession {
  screenIndex: number;
  isIndoors: boolean;
  tileContext: TileAttrContext;
  rawAttrGrid: number[][] | undefined;
  startPos: { row: number; col: number } | undefined;
  options: Omit<FloodFillOptions, 'tileContext' | 'startPos'>;
  allEntrances: OverworldEntrance[];
  groupScreens: number[];
  intraEdges: Array<{ edge: string; screens: [number, number] }>;
  quadrantBounds: QuadrantBounds | undefined;
  dualLayerGrids: { layer0: number[][]; layer1: number[][]; stairTiles: Array<{ row: number; col: number }> } | undefined;
  linkLayer: 0 | 1 | undefined;
  blockerWorldPoints: Array<{ x: number; y: number }>;
  items: string[];
}

interface SessionBuilderInput {
  isIndoors: boolean;
  primaryScreenIndex: number;
  linkX: number;
  linkY: number;
  items: string[];
  /** WASM data access functions */
  wasm: {
    getViewportInfo: () => { linkX: number; linkY: number; locationType: number } | null;
    getIndoorDualLayerGrids: () => { layer0: number[][]; layer1: number[][]; stairTiles: Array<{ row: number; col: number }> } | null;
    getIndoorLayer0Grid: () => Uint8Array | null;
    getLinkLayer: () => number | null;
    getStaircaseType: () => number | null;
    getOverworldVariant: (screenIndex: number) => { progressIndicator: number; eventOverlayActive: boolean; screenEventFlags: number } | null;
    buildOverworldAttrGrid: (screenIndex: number) => Uint8Array | null;
    getExitScreenMap: () => Map<number, number>;
    getRoomLayoutInfo: () => { shape: string; quadrantX: number; quadrantY: number; intraEdges: Array<{ edge: string; screens: [number, number] }> } | null;
    getRoomStairInfo: () => Array<{ row: number; col: number; destRoom: number }>;
    getRoomWalkBoundaries: () => Array<{ row: number; col: number; destRoom: number }>;
    getAreaHeads: () => number[] | null;
    getLiveSprites: () => Array<{ type: number; e: number; x: number; y: number }>;
    getOverworldGuardSpawns: () => Array<{ x: number; y: number }>;
    getIndoorUncleBlockers: () => Array<{ x: number; y: number }>;
    getFallHoles: () => Array<{ area: number; pos: number; entranceId: number }>;
    getOverworldEntrances: () => Array<{ area: number; pos: number; id: number }>;
    getEntranceRooms: () => number[] | null;
    getEntranceSpawns: () => Array<{ x: number; y: number; startingLayer: number }> | null;
    getRoomExitDoors: () => Array<{ row: number; col: number; direction: string }>;
  };
  /** Check if a tracker check is completed */
  isCheckCompleted: (checkName: string) => boolean;
}

const buildFloodFillSession = (input: SessionBuilderInput): FloodFillSession | null => {
  const { isIndoors, primaryScreenIndex, wasm, items, isCheckCompleted } = input;

  const vp = wasm.getViewportInfo();
  let tileContext: TileAttrContext = isIndoors ? 'interior-house' : 'overworld';
  let rawAttrGrid: number[][] | undefined;
  let dualLayerGrids: { layer0: number[][]; layer1: number[][]; stairTiles: Array<{ row: number; col: number }> } | undefined;
  let linkLayer: 0 | 1 | undefined;
  let startPos: { row: number; col: number } | undefined;

  // Build overworld dynamic blockers
  let blockerWorldPoints: Array<{ x: number; y: number }> = [];
  if (!isIndoors) {
    const live = wasm.getLiveSprites();
    const staticGuards = wasm.getOverworldGuardSpawns();
    const livePoints = live.flatMap(s => {
      if (s.type === 0x3f || s.type === 0x40 || (s.type === 0x73 && s.e === 0)) {
        const pts: Array<{ x: number; y: number }> = [];
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            pts.push({ x: s.x + dc * 8, y: s.y + dr * 8 });
          }
        }
        return pts;
      }
      return [];
    });
    const staticGuardPoints = staticGuards.flatMap(g => {
      const pts: Array<{ x: number; y: number }> = [];
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          pts.push({ x: g.x + dc * 8, y: g.y + dr * 8 });
        }
      }
      return pts;
    });
    const seen = new Set<string>();
    for (const p of [...livePoints, ...staticGuardPoints]) {
      const key = `${p.x},${p.y}`;
      if (seen.has(key)) continue;
      seen.add(key);
      blockerWorldPoints.push(p);
    }
  }

  if (vp) {
    if (isIndoors) {
      tileContext = vp.locationType === 2 ? 'interior-dungeon' : 'interior-house';
      dualLayerGrids = wasm.getIndoorDualLayerGrids() ?? undefined;
      const rawGrid = dualLayerGrids?.layer0 ?? (wasm.getIndoorLayer0Grid() ? uint8ToGrid(wasm.getIndoorLayer0Grid()!) : undefined);
      rawAttrGrid = rawGrid;
      linkLayer = (wasm.getLinkLayer() ?? undefined) as 0 | 1 | undefined;

      // Uncle blocker stamps
      if (rawAttrGrid && !isCheckCompleted("Link's Uncle")) {
        const blockers = wasm.getIndoorUncleBlockers();
        const roomWorldX = Math.floor(vp.linkX / 512) * 512;
        const roomWorldY = Math.floor(vp.linkY / 512) * 512;
        for (const b of blockers) {
          const c0 = Math.floor((b.x - roomWorldX) / 8);
          const r0 = Math.floor((b.y - roomWorldY) / 8);
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const rr = r0 + dr;
              const cc = c0 + dc;
              if (rr >= 0 && rr < 64 && cc >= 0 && cc < 64) {
                rawAttrGrid[rr][cc] = 0x01;
              }
            }
          }
        }
      }
    }

    const screenWorldX = isIndoors
      ? (Math.floor(vp.linkX / 512) * 512)
      : ((primaryScreenIndex & 7) * 512);
    const screenWorldY = isIndoors
      ? (Math.floor(vp.linkY / 512) * 512)
      : (((primaryScreenIndex >> 3) & 7) * 512);

    const relPixelX = vp.linkX - screenWorldX;
    const relPixelY = (vp.linkY + 8) - screenWorldY;

    const tileMinCol = Math.floor(relPixelX / 8);
    const tileMaxCol = Math.floor((relPixelX + 15) / 8);
    const tileMinRow = Math.floor(relPixelY / 8);
    const tileMaxRow = Math.floor((relPixelY + 15) / 8);

    const centerCol = relPixelX / 8 + 0.5;
    const centerRow = relPixelY / 8 + 0.5;
    const clamp = (v: number) => Math.max(0, Math.min(63, v));

    let best: { row: number; col: number } | null = null;
    let bestD2 = Number.POSITIVE_INFINITY;
    for (let r = tileMinRow; r <= tileMaxRow; r++) {
      for (let c = tileMinCol; c <= tileMaxCol; c++) {
        const rr = clamp(r);
        const cc = clamp(c);
        const dr = rr - centerRow;
        const dc = cc - centerCol;
        const d2 = dr * dr + dc * dc;
        if (d2 < bestD2) {
          bestD2 = d2;
          best = { row: rr, col: cc };
        }
      }
    }
    startPos = best ?? { row: clamp(Math.floor(centerRow)), col: clamp(Math.floor(centerCol)) };
  }

  // Indoor multi-screen rooms: do NOT restrict BFS with quadrant bounds.
  // constrainVoidTiles already prevents flooding through structural void into
  // genuinely disconnected halves. Quadrant bounds would incorrectly prevent
  // BFS from reaching connected halves (e.g. room 60 top/bottom).
  const roomLayout = isIndoors ? wasm.getRoomLayoutInfo() : null;
  const intraEdges = roomLayout?.intraEdges ?? [];
  const quadrantBounds: QuadrantBounds | undefined = undefined;

  // Compute group screens
  const groupScreens = isIndoors ? [primaryScreenIndex] : computeBigScreenGroupFromHeads(wasm.getAreaHeads(), primaryScreenIndex);

  // Build flood fill options
  const exitScreenByRoom = wasm.getExitScreenMap();
  const staircaseType = isIndoors ? (wasm.getStaircaseType() ?? undefined) : undefined;

  const options: Omit<FloodFillOptions, 'tileContext' | 'startPos'> = {
    inventory: new Set<TileReq>(items as TileReq[]),
    dynamicBlockers: undefined,
    entrances: [], // filled separately
    exitScreenByRoom,
    quadrantBounds: isIndoors ? quadrantBounds : undefined,
    dualLayerGrids: isIndoors ? dualLayerGrids : undefined,
    stairTiles: isIndoors ? dualLayerGrids?.stairTiles : undefined,
    startLayer: isIndoors ? linkLayer : undefined,
    staircaseType,
  };

  return {
    screenIndex: primaryScreenIndex,
    isIndoors,
    tileContext,
    rawAttrGrid,
    startPos,
    options,
    allEntrances: [], // caller enriches entrances separately
    groupScreens,
    intraEdges,
    quadrantBounds,
    dualLayerGrids,
    linkLayer,
    blockerWorldPoints,
    items,
  };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const uint8ToGrid = (raw: Uint8Array): number[][] => {
  const grid: number[][] = new Array(64);
  for (let r = 0; r < 64; r++) {
    grid[r] = new Array(64);
    for (let c = 0; c < 64; c++) {
      grid[r][c] = raw[r * 64 + c];
    }
  }
  return grid;
};

const computeBigScreenGroupFromHeads = (heads: number[] | null, screenIndex: number): number[] => {
  if (!heads) return [screenIndex];
  const myHead = heads[screenIndex];
  if (myHead === undefined) return [screenIndex];
  const group: number[] = [];
  for (let i = 0; i < 64; i++) {
    if (heads[i] === myHead) group.push(i);
  }
  return group.length > 0 ? group : [screenIndex];
};

export { buildFloodFillSession };
export type { FloodFillSession, SessionBuilderInput };
