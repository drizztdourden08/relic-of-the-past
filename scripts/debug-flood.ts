import { loadRom } from '../shared/asset-extraction/rom/rom-loader';
import { floodFillScreen, initEngine } from '../shared/game/navigation/flood-fill';
import { findBorderBundles, computeOverlap } from '../shared/game/navigation/analysis/border-bundles';
import { getScreenName } from '../shared/game/navigation/screen-names';

const rom = loadRom('./test-roms/Legend of Zelda, The - A Link to the Past (USA).sfc');
initEngine(rom);

function runFlood(label: string, inventory?: Set<string>) {
  const visited = new Set<number>();
  const queue: { screen: number; entry?: { row: number; col: number } }[] = [
    { screen: 0x2C, entry: { row: 50, col: 30 } }
  ];

  while (queue.length > 0) {
    const { screen, entry } = queue.shift()!;
    if (visited.has(screen)) continue;
    visited.add(screen);

    const result = floodFillScreen(rom, screen, inventory, entry);
    const bundles = findBorderBundles(result);

    for (const bundle of bundles) {
      const neighborScreen = getNeighborScreen(screen, bundle.direction);
      if (neighborScreen === null || neighborScreen < 0 || neighborScreen > 0x7F) continue;
      if (visited.has(neighborScreen)) continue;

      const oppositeDir = getOppositeDirection(bundle.direction);
      const neighborEntry = borderEntryPos(bundle.tiles, bundle.direction);
      const neighborResult = floodFillScreen(rom, neighborScreen, inventory, neighborEntry);
      const neighborBundles = findBorderBundles(neighborResult);
      const matching = neighborBundles.filter(b => b.direction === oppositeDir);

      for (const nb of matching) {
        const overlap = computeOverlap(bundle.tiles, nb.tiles);
        if (overlap.length > 0) {
          queue.push({ screen: neighborScreen, entry: neighborEntry });
          break;
        }
      }
    }
  }

  const sorted = [...visited].sort((a, b) => a - b);
  console.log(`\n${label}: ${visited.size} screens reached`);
  console.log('  ' + sorted.map(s => `0x${s.toString(16).padStart(2, '0')}`).join(', '));
  return visited;
}

// Progressive inventory tests
runFlood('No items');
runFlood('lift.1 (bushes)', new Set(['lift.1']));
runFlood('lift.1 + lift.2', new Set(['lift.1', 'lift.2']));
runFlood('lift.1 + hammer', new Set(['lift.1', 'hammer']));
runFlood('All overworld items', new Set(['lift.1', 'lift.2', 'hammer', 'boots', 'flippers', 'hookshot']));

function getNeighborScreen(screen: number, direction: 'n' | 's' | 'e' | 'w'): number | null {
  const row = screen >> 3;
  const col = screen & 7;
  switch (direction) {
    case 'n': return row > 0 ? ((row - 1) << 3) | col : null;
    case 's': return row < 7 ? ((row + 1) << 3) | col : null;
    case 'e': return col < 7 ? (row << 3) | (col + 1) : null;
    case 'w': return col > 0 ? (row << 3) | (col - 1) : null;
  }
}
function getOppositeDirection(dir: 'n' | 's' | 'e' | 'w'): 'n' | 's' | 'e' | 'w' {
  switch (dir) { case 'n': return 's'; case 's': return 'n'; case 'e': return 'w'; case 'w': return 'e'; }
}
function borderEntryPos(tiles: number[], direction: 'n' | 's' | 'e' | 'w'): { row: number; col: number } {
  const mid = tiles[Math.floor(tiles.length / 2)];
  switch (direction) {
    case 'n': return { row: 63, col: mid };
    case 's': return { row: 0, col: mid };
    case 'e': return { row: mid, col: 0 };
    case 'w': return { row: mid, col: 63 };
  }
}
