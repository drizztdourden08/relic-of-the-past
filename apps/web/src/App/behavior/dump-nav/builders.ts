/* @layer renderer-appshell @kind logic */
/** Pure builders for the --dump-nav debug payload (no WASM calls — data passed in). */
import { floodFillScreen, getConnections } from '@shared/game/navigation';
import type { FloodFillOptions } from '@shared/game/navigation';
import type {
  MatchingEntrance,
  FallHoleLanding,
  StairInfo,
  TravelDest,
  FloodFillDump,
} from './types';

type Spawn = { x: number; y: number } | undefined;
type EdgeName = 'north' | 'south' | 'east' | 'west';

interface EntranceDataInput {
  roomIndex: number;
  entranceRooms: ArrayLike<number> | null;
  entranceSpawns: Spawn[] | null;
  fallHoles: Array<{ entranceId: number; area: number }>;
  owEntrances: Array<{ id: number }>;
}

interface FloodFillDumpInput {
  roomIndex: number;
  attrGrid: Uint8Array | null;
  dualLayerGrids: { layer0: number[][]; layer1: number[][]; stairTiles: Array<{ row: number; col: number }> } | null;
  linkLayer: 0 | 1 | null;
  staircaseType: number | null;
  startPos?: { row: number; col: number };
  roomLayout: {
    intraEdges?: EdgeName[];
    shape?: string;
    quadrantFullsizeX?: number;
    quadrantFullsizeY?: number;
  } | null;
}

const collectEntranceData = (input: EntranceDataInput) => {
  const { roomIndex, entranceRooms, entranceSpawns, fallHoles, owEntrances } = input;

  const fallHoleEntIds = new Set<number>();
  for (const h of fallHoles) fallHoleEntIds.add(h.entranceId);

  const overworldDoorEntIds = new Set<number>();
  for (const e of owEntrances) overworldDoorEntIds.add(e.id);

  const matchingEntrances: MatchingEntrance[] = [];
  const fallHoleLandings: FallHoleLanding[] = [];

  if (entranceRooms && entranceSpawns) {
    const roomOriginX = (roomIndex % 16) * 512;
    const roomOriginY = Math.floor(roomIndex / 16) * 512;
    for (let id = 0; id < entranceRooms.length; id++) {
      if (entranceRooms[id] !== roomIndex) continue;
      const spawn = entranceSpawns[id];
      if (!spawn) continue;
      const gridCol = Math.floor((spawn.x - roomOriginX) / 8);
      const gridRow = Math.floor((spawn.y - roomOriginY) / 8);
      const isFallHole = fallHoleEntIds.has(id);
      const isOverworldDoor = overworldDoorEntIds.has(id);
      const classification = isFallHole ? 'fall-hole' : isOverworldDoor ? 'overworld-door' : 'respawn/special';
      matchingEntrances.push({ id, spawnX: spawn.x, spawnY: spawn.y, gridRow, gridCol, isFallHole, isOverworldDoor, classification });
    }
    for (const h of fallHoles) {
      if (entranceRooms[h.entranceId] === roomIndex) {
        const spawn = entranceSpawns[h.entranceId];
        if (spawn) {
          const gridCol = Math.floor((spawn.x - roomOriginX) / 8);
          const gridRow = Math.floor((spawn.y - roomOriginY) / 8);
          fallHoleLandings.push({ entranceId: h.entranceId, gridRow, gridCol, fromArea: h.area, fromAreaHex: `0x${h.area.toString(16).padStart(2, '0')}` });
        }
      }
    }
  }

  return { matchingEntrances, fallHoleLandings };
};

const formatStairs = (stairs: Array<{ destRoom: number; row: number; col: number }>): StairInfo[] =>
  stairs.map((s, i) => ({
    index: i,
    destRoom: s.destRoom,
    row: s.row,
    col: s.col,
    destRoomHex: `0x${s.destRoom.toString(16).padStart(4, '0')}`,
  })).filter(s => s.destRoom !== 0);

const formatTravelDests = (travelDests: number[] | null): TravelDest[] | null =>
  travelDests ? travelDests.map((d, i) => ({
    index: i,
    room: d,
    roomHex: `0x${d.toString(16).padStart(2, '0')}`,
    label: i === 0 ? 'pit/block' : `stair${i - 1}`,
  })).filter(td => td.room !== 0) : null;

const toGrid = (flat: Uint8Array): number[][] => {
  const grid: number[][] = [];
  for (let r = 0; r < 64; r++) {
    grid.push(Array.from(flat.slice(r * 64, (r + 1) * 64)));
  }
  return grid;
};

/** Encode the reachable grid as 64 strings of base-36 ReachState digits (0 = unreachable). */
const encodeReachableRows = (reachable: number[][]): string[] =>
  reachable.map(row => row.map(v => v.toString(36)).join(''));

/** Encode a raw attr grid as 64 strings of 2-char hex bytes (for baselines/diagnosis). */
const encodeAttrRows = (grid: number[][]): string[] =>
  grid.map(row => row.map(v => v.toString(16).padStart(2, '0')).join(''));

const computeFloodFill = (input: FloodFillDumpInput): FloodFillDump | null => {
  const { roomIndex, attrGrid, dualLayerGrids, linkLayer, staircaseType, roomLayout, startPos } = input;
  if (!attrGrid) return null;

  const grid = toGrid(attrGrid);
  const opts: FloodFillOptions = {
    tileContext: 'interior-dungeon',
    inventory: new Set(),
    startPos,
    dualLayerGrids: dualLayerGrids ?? undefined,
    stairTiles: dualLayerGrids?.stairTiles,
    startLayer: linkLayer ?? undefined,
    staircaseType: staircaseType ?? undefined,
  };
  const result = floodFillScreen(grid, roomIndex, opts);
  const connections = getConnections(result, roomLayout?.intraEdges);

  // Detect scroll boundaries
  const shape = roomLayout?.shape ?? '1x1';
  const qfx = roomLayout?.quadrantFullsizeX ?? 0;
  const qfy = roomLayout?.quadrantFullsizeY ?? 0;
  const hasHorizontalBoundary = (shape === '2x2' || shape === '1x2') && qfy === 0;
  const hasVerticalBoundary = (shape === '2x2' || shape === '2x1') && qfx === 0;

  // Find tiles crossing the boundary
  const crossingTiles: { axis: string; pos: number }[] = [];
  if (hasHorizontalBoundary) {
    for (let col = 0; col < 64; col++) {
      if (result.reachable[31]?.[col] && result.reachable[32]?.[col]) {
        crossingTiles.push({ axis: 'horizontal', pos: col });
      }
    }
  }
  if (hasVerticalBoundary) {
    for (let row = 0; row < 64; row++) {
      if (result.reachable[row]?.[31] && result.reachable[row]?.[32]) {
        crossingTiles.push({ axis: 'vertical', pos: row });
      }
    }
  }

  return {
    reachableCount: result.reachableCount,
    totalTiles: result.totalTiles,
    reachableRows: encodeReachableRows(result.reachable),
    ledges: result.ledges.map(({ startRow, startCol, endRow, endCol }) => ({ startRow, startCol, endRow, endCol })),
    attrRows: {
      layer0: encodeAttrRows(dualLayerGrids?.layer0 ?? grid),
      layer1: dualLayerGrids ? encodeAttrRows(dualLayerGrids.layer1) : null,
    },
    connections: connections.map(c => ({
      edge: c.edge,
      targetScreen: c.targetScreen,
      targetScreenHex: `0x${c.targetScreen.toString(16).padStart(4, '0')}`,
      isIntraRoom: c.isIntraRoom ?? false,
      layerToggle: c.layerToggle ?? false,
      freeTileCount: c.freeTileCount,
      itemTileCount: c.itemTileCount,
      positions: c.positions,
    })),
    scrollBoundary: {
      shape,
      quadrantFullsizeX: qfx,
      quadrantFullsizeY: qfy,
      hasHorizontalBoundary,
      hasVerticalBoundary,
      crossingTiles,
    },
  };
};

const computeOverworldFloodFill = (
  screenIndex: number,
  attrGrid: Uint8Array | null,
  startPos?: { row: number; col: number },
): FloodFillDump | null => {
  if (!attrGrid) return null;

  const result = floodFillScreen(toGrid(attrGrid), screenIndex, { tileContext: 'overworld', inventory: new Set(), startPos });
  const connections = getConnections(result);

  return {
    reachableCount: result.reachableCount,
    totalTiles: result.totalTiles,
    reachableRows: encodeReachableRows(result.reachable),
    ledges: result.ledges.map(({ startRow, startCol, endRow, endCol }) => ({ startRow, startCol, endRow, endCol })),
    attrRows: { layer0: encodeAttrRows(toGrid(attrGrid)), layer1: null },
    connections: connections.map(c => ({
      edge: c.edge,
      targetScreen: c.targetScreen,
      targetScreenHex: `0x${c.targetScreen.toString(16).padStart(4, '0')}`,
      freeTileCount: c.freeTileCount,
      itemTileCount: c.itemTileCount,
      positions: c.positions,
    })),
    scrollBoundary: null,
  };
};

export { collectEntranceData, formatStairs, formatTravelDests, computeFloodFill, computeOverworldFloodFill };
