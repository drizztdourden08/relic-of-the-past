/* @layer bridge-wasm @kind logic */
/**
 * Addressable single-screen overworld flood for the game-driven simulator.
 * Builds a screen's collision grid offline (works for any screen, not just the
 * loaded one) and runs the SAME shared floodFillScreen the nav widget uses, with
 * the SAME options (inventory + progress variant + entrances + exit map + solid-
 * sprite blockers), so the numbers match a normal in-game flood. No rendering,
 * no player movement — this is the per-screen unit the chained BFS drives.
 *
 * Blockers are derived addressably from WasmGetOverworldSpriteSpawns (which is
 * progress-aware), so a remote screen (one the game isn't standing on) still gets
 * the guard/uncle footprints the live buildOverworldBlockers would produce.
 *
 * NOTE (prototype): enrichEntrances still lives in the nav widget layer; it only
 * reads addressable WASM tables, so it is reused here pending a move to the bridge.
 */
import { wasmBuildOverworldAttrGrid, wasmGetExitScreenMap, wasmGetOverworldVariant, wasmGetOverworldSpriteSpawns } from '../';
import { floodFillScreen, getConnections, usableEntranceTransition } from '@shared/game/navigation';
import type { ConnectionInfo, FloodFillResult, GridPos, TransitionPoint } from '@shared/game/navigation';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import { enrichEntrances } from '@domains/widgets/navigation/widget-helpers';
import { buildFloodOptions, getScreenGrids } from '../flood';

// Sprite types that block BFS (mirrors buildOverworldBlockers): tutorial guards
// (0x3f), barriers (0x40), uncle (0x73). Each stamps a 3×3 footprint.
const BLOCKER_SPRITES = new Set([0x3f, 0x40, 0x73]);

interface ScreenFlood {
  reachableCount: number;
  totalTiles: number;
  ledgeCount: number;
  entranceCount: number;
  edgeCount: number;
  /** Intra-room scroll boundaries (a 2×2 room's internal doorway crossings). */
  intraCount: number;
  connections: ConnectionInfo[];
}

interface ScreenFloodRun {
  result: FloodFillResult;
  connections: ConnectionInfo[];
}

const toGrid = (flat: Uint8Array): number[][] => {
  const grid: number[][] = [];
  for (let r = 0; r < 64; r++) grid.push(Array.from(flat.slice(r * 64, (r + 1) * 64)));
  return grid;
};

/** Solid-sprite blocker cells for a screen, read addressably (progress-aware). */
const blockerCells = (screenIndex: number): GridPos[] => {
  const cells: GridPos[] = [];
  for (const s of wasmGetOverworldSpriteSpawns(screenIndex)) {
    if (!BLOCKER_SPRITES.has(s.spriteType)) continue;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const row = s.row + dr;
        const col = s.col + dc;
        if (row >= 0 && row < 64 && col >= 0 && col < 64) cells.push({ row, col });
      }
    }
  }
  return cells;
};

/** Run one addressable overworld screen flood; null when the grid can't build. */
const floodOneOverworld = (
  screenIndex: number,
  items: TileReq[],
  startPos?: GridPos,
  extraSeeds?: GridPos[],
): ScreenFloodRun | null => {
  const bundle = getScreenGrids({ isIndoors: false, roomId: 0, owScreenIndex: screenIndex });
  if (!bundle.rawAttrGrid.length) return null;
  // Options come from the one builder, same as the indoor flood — a hand-rolled
  // set here is how the overworld numbers drifted from the room numbers.
  const result = floodFillScreen(bundle.rawAttrGrid, bundle.screenIndex, buildFloodOptions({
    location: { isIndoors: false, roomId: 0, owScreenIndex: screenIndex },
    items,
    startPos,
    extraSeeds,
    // ONLY this screen's own entrances. The full list was being seeded into every
    // screen's flood, and an entrance is placed by its 64x64 grid position with the
    // `area` never consulted — so any screen whose flood reached that tile grew a
    // door belonging to somewhere else entirely. Entrances 101 and 102 both sit at
    // (34,30), which is how Great Lake NW acquired a door into the psychic's hut
    // two-thirds of the map away.
    entrances: enrichEntrances().filter((e) => e.area === screenIndex),
  }, bundle));
  return { result, connections: getConnections(result) };
};

/**
 * An entrance transition the player can ACTUALLY take right now: the BFS reached it
 * without unmet item tiles, and the entrance tile itself isn't sitting under an
 * item-locked obstacle (e.g. the Uncle-Estate-West stairs buried under a rock —
 * the proximity trigger fires from beside the rock, but the way in is sealed).
 */

/** Summarise a run the way the nav widget reports its numbers. */
const summarizeRun = (run: ScreenFloodRun, items: TileReq[]): ScreenFlood => {
  const { result, connections } = run;
  const entranceCount = result.entrances.filter((e) =>
    result.transitions.some((t) => t.entranceIdx === e.id && usableEntranceTransition(result, t, items)),
  ).length;
  const intraCount = connections.filter((c) => c.isIntraRoom).length;
  return {
    reachableCount: result.reachableCount,
    totalTiles: result.totalTiles,
    ledgeCount: result.ledges.length,
    entranceCount,
    edgeCount: connections.length - intraCount,
    intraCount,
    connections,
  };
};

/** Flood an overworld screen addressably (the game need not be standing on it). */
const floodOverworldScreen = (screenIndex: number, startPos?: GridPos, items: TileReq[] = ['lift.1']): ScreenFlood | null => {
  const run = floodOneOverworld(screenIndex, items, startPos);
  return run ? summarizeRun(run, items) : null;
};

export { floodOneOverworld, floodOverworldScreen, summarizeRun, usableEntranceTransition, blockerCells };
export type { ScreenFlood, ScreenFloodRun };
