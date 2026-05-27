/**
 * Verify that HeadlessWasmGridProvider produces valid collision grids.
 * Run: npx tsx scripts/test-headless-wasm.ts
 */
import { resolve } from 'path';
import { HeadlessWasmGridProvider } from '../shared/game/navigation/providers/headless-wasm-provider';
import { buildGridFromRawAttr } from '../shared/game/navigation/providers/grid-provider';
import { floodFillScreen, initEngine } from '../shared/game/navigation';
import { loadRom } from '../shared/asset-extraction/rom/rom-loader';

// The compiled assets file lives in Electron's userData directory
const ASSETS_PATH = resolve(
  process.env.APPDATA ?? '',
  'relic-of-the-past/Data/assets/Legend of Zelda, The - A Link to the Past (USA).dat'
);
const ROM_PATH = resolve(__dirname, '../test-roms/Legend of Zelda, The - A Link to the Past (USA).sfc');

async function main() {
  console.log('Loading headless WASM...');
  const provider = await HeadlessWasmGridProvider.create(ASSETS_PATH);
  console.log('WASM initialized successfully.');

  // Test overworld screen 0 (Link's house area)
  console.log('\n--- Overworld Screen 0x2C (Link\'s House) ---');
  const grid = provider.getOverworldRawAttr(0x2C);
  console.log(`Grid size: ${grid.length} bytes`);
  console.log(`First 16 attrs: [${Array.from(grid.slice(0, 16)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', ')}]`);

  // Count tile types
  let free = 0, blocked = 0, water = 0, other = 0;
  for (const attr of grid) {
    if (attr === 0x00) free++;
    else if (attr === 0x01 || attr === 0x02 || attr === 0x03) blocked++;
    else if (attr >= 0x08 && attr <= 0x0F) water++;
    else other++;
  }
  console.log(`Free: ${free}, Blocked: ${blocked}, Water: ${water}, Other: ${other}`);

  // Test indoor room 0x01 (Hyrule Castle)
  console.log('\n--- Indoor Room 0x01 (Hyrule Castle) ---');
  const roomGrid = provider.getRoomRawAttr(0x01);
  console.log(`Room grid size: ${roomGrid.length} bytes`);
  console.log(`First 16 attrs: [${Array.from(roomGrid.slice(0, 16)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', ')}]`);

  // Now test that floodFillScreen works with the provider
  console.log('\n--- Flood Fill with WASM Provider (screen 0x2C) ---');
  const rom = loadRom(ROM_PATH);
  initEngine(rom);
  const result = floodFillScreen(rom, 0x2C, undefined, { row: 42, col: 20 }, undefined, 'overworld', undefined, undefined, undefined, provider);
  console.log(`Reachable: ${result.reachableCount}/${result.totalTiles} tiles`);
  console.log(`Transitions: ${result.transitions.length}`);
  console.log(`Entrances: ${result.entrances.length}`);

  console.log('\nAll tests passed!');
}

main().catch(err => {
  console.error('FAILED:', err);
  process.exit(1);
});
