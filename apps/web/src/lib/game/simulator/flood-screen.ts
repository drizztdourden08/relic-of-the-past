/* @layer bridge-wasm @kind logic */
/**
 * The simulator's view of one overworld screen: the shared flood, plus the
 * summary numbers the run and the nav widget both report.
 *
 * The flood itself is not here. `floodOneScreen` (lib/game/flood/flood-area.ts)
 * runs it for every caller, so a screen flooded from a given seed answers the
 * same for the widget and for the run. What this file adds is the summary and
 * the diagnostics the run needs on top.
 */
import { wasmGetOverworldSpriteSpawns } from '../';
import { usableEntranceTransition } from '@shared/game/navigation';
import type { ConnectionInfo, FloodFillResult, GridPos } from '@shared/game/navigation';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import { enrichEntrances } from '../flood/overworld-entrances';
import { floodOneScreen, getScreenGrids } from '../flood';

interface ScreenFlood {
  reachableCount: number;
  totalTiles: number;
  ledgeCount: number;
  entranceCount: number;
  edgeCount: number;
  /** Intra-room scroll boundaries (a 2×2 room's internal doorway crossings). */
  intraCount: number;
  connections: ConnectionInfo[];
  /** Raw attrs + reach for the rows nearest one edge — shows whether a border
   *  crossing runs over open ground or over a cliff face. Diagnostic only. */
  edgeRows?: Array<{ row: number; raw: string; reached: string }>;
  /** Sprites this screen's spawn table reports, and whether the flood can stand
   *  by each. ⚠ For a LARGE (multi-screen) area the table is the whole area's and
   *  its coordinates are area-relative — they run past 63 and do not index a
   *  single screen's grid, so `reached` is only meaningful on a small screen. */
  sprites?: Array<{ type: string; row: number; col: number; reached: boolean }>;
}

interface ScreenFloodRun {
  result: FloodFillResult;
  connections: ConnectionInfo[];
}

/** Run one addressable overworld screen flood; null when the grid can't build.
 *  Straight through to the shared flood — the widget calls the same function, so
 *  the same seed on the same screen cannot give the two of them different numbers. */
const floodOneOverworld = (
  screenIndex: number,
  items: TileReq[],
  startPos?: GridPos,
  extraSeeds?: GridPos[],
): ScreenFloodRun | null => floodOneScreen(
  { isIndoors: false, roomId: 0, owScreenIndex: screenIndex },
  { items, ...(startPos ? { startPos } : {}), ...(extraSeeds ? { extraSeeds } : {}), entrances: enrichEntrances() },
);

/**
 * An entrance transition the player can ACTUALLY take right now: the BFS reached it
 * without unmet item tiles, and the entrance tile itself isn't sitting under an
 * item-locked obstacle (e.g. the Uncle-Estate-West stairs buried under a rock —
 * the proximity trigger fires from beside the rock, but the way in is sealed).
 */

/** Summarise a run the way the nav widget reports its numbers. */
const summarizeRun = (run: ScreenFloodRun, items: TileReq[], screenIndex?: number): ScreenFlood => {
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
    ...(screenIndex === undefined ? {} : { sprites: wasmGetOverworldSpriteSpawns(screenIndex).map((sp) => ({
      type: `0x${sp.spriteType.toString(16)}`,
      row: sp.row,
      col: sp.col,
      reached: (() => {
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) if ((result.reachable[sp.row + dr]?.[sp.col + dc] ?? 0) > 0) return true;
        }
        return false;
      })(),
    })) }),
    edgeRows: screenIndex === undefined ? undefined : (() => {
      const grid = getScreenGrids({ isIndoors: false, roomId: 0, owScreenIndex: screenIndex }).rawAttrGrid;
      const out = [];
      for (const row of [0, 1, 2, 3, 60, 61, 62, 63]) {
        out.push({
          row,
          raw: (grid[row] ?? []).slice(14, 32).map((v) => v.toString(16).padStart(2, '0')).join(' '),
          reached: (result.reachable[row] ?? []).slice(14, 32).map((v) => (v > 0 ? '#' : '.')).join(''),
        });
      }
      return out;
    })(),
  };
};

/** Flood an overworld screen addressably (the game need not be standing on it). */
const floodOverworldScreen = (screenIndex: number, startPos?: GridPos, items: TileReq[] = ['lift.1']): ScreenFlood | null => {
  const run = floodOneOverworld(screenIndex, items, startPos);
  return run ? summarizeRun(run, items, screenIndex) : null;
};

export { floodOneOverworld, floodOverworldScreen, summarizeRun, usableEntranceTransition };
export type { ScreenFlood, ScreenFloodRun };
