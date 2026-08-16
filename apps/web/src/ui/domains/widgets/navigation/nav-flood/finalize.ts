/* @layer renderer-widgets @kind logic */
/** Post-flood finalization: layer-toggle annotation, indoor screen bundle, fall-hole landings. */
import {
  wasmGetToggleFloorPositions, wasmGetDungeonMapPosition,
  wasmGetEntranceSpawns, wasmGetEntranceRooms, wasmGetFallHoles,
} from '../../../../../lib/game';
import { spawnLandingTile } from '../../../../../lib/game/flood';
import { togglesLayer } from '../../../../../lib/game/crossings';
import type { wasmGetRoomLayoutInfo } from '../../../../../lib/game';
import type { ConnectionInfo, ScreenBundle } from '@shared/game/navigation';

type EdgeName = 'north' | 'south' | 'east' | 'west';
type FallHoleLanding = { gridRow: number; gridCol: number; entranceId: number };

/**
 * Stamps the border bundles the overlay and the internal-edge lists read. The
 * crossing facade answers the same question for its own edge records off the
 * same predicate, so both views of one boundary agree.
 */
const annotateLayerToggles = (allConnections: ConnectionInfo[], isIndoors: boolean): void => {
  if (!isIndoors) return;
  const toggles = wasmGetToggleFloorPositions();
  for (const conn of allConnections) {
    if (togglesLayer(conn.edge, conn.positions, toggles)) conn.layerToggle = true;
  }
};

interface IndoorBundleArgs {
  screenName: string;
  primaryScreenIndex: number;
  allConnections: ConnectionInfo[];
  roomLayout: ReturnType<typeof wasmGetRoomLayoutInfo>;
  intraEdges: EdgeName[];
}

const buildIndoorScreenBundle = (args: IndoorBundleArgs): ScreenBundle => {
  const { screenName, primaryScreenIndex, allConnections, roomLayout, intraEdges } = args;
  const connectedRooms = new Set<number>([primaryScreenIndex]);
  for (const c of allConnections) {
    if (!c.isIntraRoom) connectedRooms.add(c.targetScreen);
  }
  const roomList = [...connectedRooms];

  // For multi-screen rooms, expand into virtual quadrant cells.
  // Shape determines the grid dimensions of the current room.
  const shape = roomLayout?.shape ?? '1x1';
  const roomGridCols = (shape === '2x2' || shape === '2x1') ? 2 : 1;
  const roomGridRows = (shape === '2x2' || shape === '1x2') ? 2 : 1;
  // Determine multi-screen room from layout info directly (not BFS transitions,
  // since BFS now floods the full grid without quadrant bounds).
  const hasIntraEdges = intraEdges.length > 0;

  // Get effective layout from dungeon map data (how many cells this room occupies)
  const mapPos = wasmGetDungeonMapPosition();
  const effLayout = mapPos?.found ? { width: mapPos.effectiveWidth, height: mapPos.effectiveHeight } : undefined;

  // Use effective layout from map data for grid dimensions when available,
  // fall back to quadrant-based shape otherwise
  const effCols = effLayout ? effLayout.width : (hasIntraEdges ? roomGridCols : 1);
  const effRows = effLayout ? effLayout.height : (hasIntraEdges ? roomGridRows : 1);

  return {
    name: screenName,
    screens: roomList,
    cols: Math.max(effCols, roomList.length > 1 ? 2 : 1),
    rows: Math.max(effRows, roomList.length > 1 ? 2 : 1),
    subNames: {}, screenNames: {},
    isMulti: (effLayout ? (effLayout.width > 1 || effLayout.height > 1) : hasIntraEdges) || roomList.length > 1,
    head: primaryScreenIndex,
    roomShape: hasIntraEdges ? shape : undefined,
    activeQuadrant: hasIntraEdges ? { x: roomLayout!.quadrantX, y: roomLayout!.quadrantY } : undefined,
    effectiveLayout: effLayout,
  };
};

const computeFallHoleLandings = (primaryScreenIndex: number, isIndoors: boolean): FallHoleLanding[] => {
  // Compute fall hole landing positions for indoor rooms
  const fallHoleSpawns: FallHoleLanding[] = [];
  if (!isIndoors) return fallHoleSpawns;
  const spawns = wasmGetEntranceSpawns();
  const rooms = wasmGetEntranceRooms();
  const holes = wasmGetFallHoles();
  if (spawns && rooms && holes) {
    const roomOriginX = (primaryScreenIndex % 16) * 512;
    const roomOriginY = Math.floor(primaryScreenIndex / 16) * 512;
    for (const h of holes) {
      if (rooms[h.entranceId] === primaryScreenIndex) {
        const spawn = spawns[h.entranceId];
        if (spawn) {
          const { row: gridRow, col: gridCol } = spawnLandingTile(spawn.x, spawn.y, { x: roomOriginX, y: roomOriginY });
          if (gridRow >= 0 && gridRow < 64 && gridCol >= 0 && gridCol < 64) {
            fallHoleSpawns.push({ gridRow, gridCol, entranceId: h.entranceId });
          }
        }
      }
    }
  }
  return fallHoleSpawns;
};

export { annotateLayerToggles, buildIndoorScreenBundle, computeFallHoleLandings };
