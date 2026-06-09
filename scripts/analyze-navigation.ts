/* @layer tooling-scripts @kind logic */
/**
 * analyze-navigation.ts — Offline navigation data analysis script.
 *
 * Runs WASM headlessly (no Electron) to compute tile-level navigation data
 * for every overworld screen. Populates ScreenNavData and ConnectionNavData
 * fields on the data model.
 *
 * Usage: npx tsx scripts/analyze-navigation.ts [--output <path>] [--screen <hex>]
 *
 * Design:
 *   1. Load WASM module (node + WASI, no browser)
 *   2. For each overworld screen: build attr grid → flood fill → collect stats
 *   3. Run border-bundle overlap analysis for all adjacent screen pairs
 *   4. Resolve entrances using WASM entrance tables
 *   5. Detect requirements via progressive inventory BFS
 *   6. Write computed nav data to output (JSON or patched .ts)
 *
 * This is the ONE place where we exercise the full game simulation to
 * extract navigation truth. Everything downstream reads from the output.
 */

import { resolve } from 'path';
import { writeFileSync } from 'fs';

// ─── Navigation imports ──────────────────────────────────────────────────────
import { floodFillScreen, getConnections } from '../shared/game/navigation';
import type { TileAttrContext } from '../shared/game/navigation';
import {
  runGlobalFlood,
  resolveEntrances,
  detectRequirements,
  findBorderBundles,
  computeOverlap,
  buildScreenNavUpdates,
  buildConnectionNavUpdates,
} from '../shared/game/navigation/analysis';

// ─── Data model imports ──────────────────────────────────────────────────────
import { ALL_SCREENS } from '../shared/game/data/screens';
import { ALL_CONNECTIONS } from '../shared/game/data/connections';
import type { RegionNavData, ConnectionNavData } from '../shared/game/navigation/nav-data.types';

// ─── CLI Args ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const outputIdx = args.indexOf('--output');
const outputPath = outputIdx >= 0 ? args[outputIdx + 1] : resolve(__dirname, '../apps/desktop/public/data/nav-data.json');
const screenIdx = args.indexOf('--screen');
const singleScreen = screenIdx >= 0 ? parseInt(args[screenIdx + 1], 16) : null;

// ─── WASM Loading (stub — requires headless WASM loader) ─────────────────────

const loadWasm = async (): Promise<{
  buildOverworldAttrGrid: (screenIndex: number) => number[][];
  getOverworldEntrances: () => { area: number; pos: number; id: number }[];
  getExitScreenMap: () => Map<number, number>;
  getAreaHeads: () => Uint8Array;
  getEntranceRooms: () => Uint16Array;
}> => {
  // Stub — will load WASM and return bridge functions
  throw new Error(
    'Headless WASM loader not yet implemented. ' +
    'Requires node-compatible WASM instantiation of zelda3.wasm'
  );
};

// ─── Main ────────────────────────────────────────────────────────────────────

const main = async () => {
  console.log('=== Navigation Analysis ===');
  console.log(`Output: ${outputPath}`);
  if (singleScreen != null) {
    console.log(`Single screen mode: 0x${singleScreen.toString(16)}`);
  }

  // 1. Load WASM
  const wasm = await loadWasm();

  // 2. Determine screen set
  const allScreenIndices = ALL_SCREENS
    .filter(r => r.type === 'overworld' && r.roomIndex != null)
    .map(r => r.roomIndex!);

  const screenSet = singleScreen != null ? [singleScreen] : allScreenIndices;
  console.log(`Analyzing ${screenSet.length} screens...`);

  // 3. Global flood fill
  const tileContext: TileAttrContext = 'overworld';
  const globalResult = runGlobalFlood({
    getGrid: (idx) => wasm.buildOverworldAttrGrid(idx),
    tileContext,
    screenIndices: screenSet,
  });

  // 4. Border bundle analysis
  const borderResults = new Map<string, number[]>();
  for (const screenIndex of screenSet) {
    const grid = wasm.buildOverworldAttrGrid(screenIndex);
    const result = floodFillScreen(grid, screenIndex, { tileContext });
    const connections = getConnections(result);

    for (const conn of connections) {
      const key = `${screenIndex}-${conn.targetScreen}`;
      borderResults.set(key, conn.positions.map(p => p.col));
    }
  }

  // 5. Entrance resolution
  const entrances = wasm.getOverworldEntrances().map(e => ({
    area: e.area,
    pos: e.pos,
    id: e.id,
  }));
  const exitScreenByRoom = wasm.getExitScreenMap();
  const entranceRooms = wasm.getEntranceRooms();
  const resolvedEntrances = resolveEntrances({ entrances, exitScreenByRoom, entranceRooms });

  // 6. Requirement detection (per screen)
  // TODO: Implement progressive inventory BFS per screen

  // 7. Build nav data updates
  const screenUpdates = buildScreenNavUpdates(
    new Map(Array.from(globalResult.screens.entries()).map(([idx, stats]) => [
      idx,
      { ...stats, connectionPointIds: [], obstacles: [], features: [] } as RegionNavData,
    ]))
  );

  const connectionUpdates = buildConnectionNavUpdates(borderResults, new Map());

  // 8. Write output
  const output = {
    generatedAt: new Date().toISOString(),
    screens: screenUpdates,
    connections: connectionUpdates,
  };

  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`Wrote ${screenUpdates.length} screen updates, ${connectionUpdates.length} connection updates`);
  console.log('Done.');
};

main().catch((err) => {
  console.error('Analysis failed:', err.message);
  process.exit(1);
});
