import type { RomData } from '../../../asset-extraction/rom/rom-types';
import type { WorldFloodResult, ScreenCoverage, GridPos } from '../types';
import { getAdjacentScreen } from '../screen-hop';
import { floodFillScreen } from './orchestrator';

const LW_SCREENS = 64;

/** Mirror a border position to the entry point on the adjacent screen. */
function mirrorEntry(pos: number, edge: 'north' | 'south' | 'east' | 'west'): GridPos {
  switch (edge) {
    case 'north': return { row: 63, col: pos };
    case 'south': return { row: 0, col: pos };
    case 'west': return { row: pos, col: 63 };
    case 'east': return { row: pos, col: 0 };
  }
}

/**
 * Propagate BFS across all reachable overworld screens.
 * Entry point #2: world-wide flood fill.
 *
 * Starts from a screen/position and crosses borders until no new
 * reachable areas are discovered. Handles multi-entry (areas only
 * reachable from a different direction on the same screen).
 */
export function floodFillWorld(
  rom: RomData,
  startScreen: number,
  inventory: Set<string>,
  startPos?: GridPos,
): WorldFloodResult {
  const startTime = performance.now();
  const screens = new Map<number, ScreenCoverage>();
  const queue: [number, number, number][] = [];
  let bfsRuns = 0;

  const entryKey = (r: number, c: number) => `${r},${c}`;
  const usedEntries = new Map<number, Set<string>>();

  // Seed with starting position
  const sp = startPos ?? { row: 16, col: 20 };
  queue.push([startScreen, sp.row, sp.col]);
  usedEntries.set(startScreen, new Set([entryKey(sp.row, sp.col)]));

  while (queue.length > 0) {
    const [screenIdx, entryRow, entryCol] = queue.shift()!;
    if (screenIdx < 0 || screenIdx >= LW_SCREENS) continue;

    const key = entryKey(entryRow, entryCol);
    if (!usedEntries.has(screenIdx)) usedEntries.set(screenIdx, new Set());
    const used = usedEntries.get(screenIdx)!;
    if (used.has(key)) continue;
    used.add(key);

    let result;
    try {
      result = floodFillScreen(rom, screenIdx, inventory, { row: entryRow, col: entryCol });
    } catch { continue; }
    bfsRuns++;

    let state = screens.get(screenIdx);
    if (!state) {
      state = {
        screenIndex: screenIdx,
        entries: [{ row: entryRow, col: entryCol }],
        reachableCount: result.reachableCount,
        reachable: result.reachable.map(row => [...row]),
        borderFree: {
          north: new Set(result.borders.north.freeTiles),
          south: new Set(result.borders.south.freeTiles),
          east: new Set(result.borders.east.freeTiles),
          west: new Set(result.borders.west.freeTiles),
        },
      };
      screens.set(screenIdx, state);
    } else {
      // Merge new reachable tiles
      state.entries.push({ row: entryRow, col: entryCol });
      let newTiles = 0;
      for (let r = 0; r < 64; r++) {
        for (let c = 0; c < 64; c++) {
          if (result.reachable[r][c] && !state.reachable[r][c]) {
            state.reachable[r][c] = true;
            newTiles++;
          }
        }
      }
      if (newTiles === 0) continue;
      state.reachableCount += newTiles;
    }

    // Queue adjacent screens from border transitions
    for (const edge of ['north', 'south', 'east', 'west'] as const) {
      const adjScreen = getAdjacentScreen(screenIdx, edge);
      if (adjScreen === null || adjScreen >= LW_SCREENS) continue;

      const newFree = result.borders[edge].freeTiles;
      const prevBorder = state.borderFree[edge];
      const novel = newFree.filter(p => !prevBorder.has(p));
      const toProcess = state.entries.length === 1 ? newFree : novel;

      for (const p of newFree) prevBorder.add(p);
      if (toProcess.length === 0) continue;

      // Sample entries: every 8 tiles + first + last
      const sampled = new Set<string>();
      for (let i = 0; i < toProcess.length; i += 8) {
        const entry = mirrorEntry(toProcess[i], edge);
        const k = entryKey(entry.row, entry.col);
        if (!sampled.has(k)) { sampled.add(k); queue.push([adjScreen, entry.row, entry.col]); }
      }
      const first = mirrorEntry(toProcess[0], edge);
      const last = mirrorEntry(toProcess[toProcess.length - 1], edge);
      for (const entry of [first, last]) {
        const k = entryKey(entry.row, entry.col);
        if (!sampled.has(k)) { sampled.add(k); queue.push([adjScreen, entry.row, entry.col]); }
      }
    }
  }

  const totalReachable = [...screens.values()].reduce((s, c) => s + c.reachableCount, 0);
  const totalPossible = screens.size * 4096;

  return {
    screens,
    totalReachable,
    totalPossible,
    elapsedMs: performance.now() - startTime,
    bfsRuns,
  };
}
